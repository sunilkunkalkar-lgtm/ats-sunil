# Northline ATS

A centralized applicant tracking system for a four-recruiter desk hiring ~60 people per quarter. It replaces shared spreadsheets with one candidate record, hard duplicate blocking, 3-week SLA clocks, a Kanban pipeline, and a live client status view.

**Northline ATS is not Suii ATS.** Suii is a separate product in [`suii-ats/`](./suii-ats): its own database, recruiter sessions, UI, and port (`3002`). Do not mix the two desks.

## Open in Chrome (Windows)

The Cursor preview is **not** the same as Chrome. Chrome can only open the app if it is running on **your PC**.

1. Install Node.js LTS from https://nodejs.org (restart Cursor after installing).
2. Download or pull this repo onto your computer.
3. Double-click **`start-ats.bat`**. Leave that black window open.
4. Chrome should open **http://127.0.0.1:3000** after about 10 seconds. If it does not, paste that address yourself. Use `http`, never `https`, and never port `3001`.

If double-click does nothing, right-click `start-ats.bat` → **Run as administrator** is not required; if Windows blocks it, click **More info** → **Run anyway**.

## Recommended relational schema

SQLite in development (`prisma/schema.prisma`); the same model maps cleanly to Postgres in production.

### Recruiters
| Column | Type | Notes |
| --- | --- | --- |
| id | cuid | PK |
| name | text | |
| email | text | unique |
| createdAt | datetime | |

### Clients
Supporting table so roles are tagged by client without repeating strings.

| Column | Type | Notes |
| --- | --- | --- |
| id | cuid | PK |
| name | text | unique |

### Roles (requisitions)
| Column | Type | Notes |
| --- | --- | --- |
| id | cuid | PK |
| title | text | e.g. Java Developer |
| clientId | FK → Clients | |
| priority | enum | `NEW_PROJECT` \| `BACKFILL` |
| status | enum | `OPEN` \| `FILLED` \| `CANCELLED` |
| slaDays | int | default 21 (3-week fulfillment) |
| openedAt | datetime | SLA countdown start |
| headcount | int | |
| ownerId | FK → Recruiters | requisition owner |

### Candidates
| Column | Type | Notes |
| --- | --- | --- |
| id | cuid | PK |
| firstName, lastName | text | |
| email | text | **unique**, stored lowercased |
| phone | text | **unique**, digits only (US `+1` stripped) |
| ownerId | FK → Recruiters | current owner — the only person who may log contact |
| createdAt, updatedAt | datetime | |

Unique indexes on email and phone are the hard gate. Application code still checks first so a conflict response can include owner + latest `ActivityLog` instead of a raw constraint error.

### Applications
A candidate may sit on multiple requisitions, but only once per role.

| Column | Type | Notes |
| --- | --- | --- |
| id | cuid | PK |
| candidateId | FK → Candidates | |
| roleId | FK → Roles | |
| status | enum | `SOURCED` → `CONTACTED` → `INTERVIEWING` → `OFFERED` → `ACCEPTED` → `JOINED`, plus `OFFER_DROPOFF` |
| dropoffReason | enum nullable | required when status is `OFFER_DROPOFF`: Counter-offer, Ghosted, Salary mismatch, Accepted elsewhere, Personal, Other |
| dropoffNotes | text | |
| recruiterId | FK → Recruiters | who sourced them onto the role |
| unique(candidateId, roleId) | | |

Offer-to-join reporting treats the cohort as `OFFERED + ACCEPTED + JOINED + OFFER_DROPOFF`. Drop-off % is `OFFER_DROPOFF / cohort`. Join % is `JOINED / cohort`.

### Activity Log
| Column | Type | Notes |
| --- | --- | --- |
| id | cuid | PK |
| candidateId | FK → Candidates | |
| applicationId | FK nullable | |
| recruiterId | FK → Recruiters | actor |
| type | enum | `NOTE`, `CALL`, `EMAIL`, `OUTREACH`, `STATUS_CHANGE`, `DUPLICATE_BLOCK` |
| body | text | |
| createdAt | datetime | indexed with candidateId |

Non-owners cannot insert activity. Duplicate create/contact attempts insert a `DUPLICATE_BLOCK` row on the existing candidate so the attempt is auditable.

```
Recruiters 1──* Candidates
Recruiters 1──* Roles
Clients    1──* Roles
Candidates 1──* Applications *──1 Roles
Candidates 1──* ActivityLog
Applications 1──* ActivityLog
```

## Implementation plan (done in this repo)

1. **Model the desk, not the spreadsheet.** Recruiter identity is a session cookie so concurrent users can switch and prove ownership blocking. Production would swap this for SSO.
2. **Identity service.** Normalize email/phone, unique constraints, `409` payload with owner + last log on create and on “pre-contact check.”
3. **Requisitions.** Client + priority + 21-day countdown from `openedAt`.
4. **Kanban.** Applications as cards; drop-off column requires a reason code.
5. **Live reporting.** Per-role counts for the client view (`Java Developer: 15 sourced, 3 interviewing, 1 offer`) plus CSV export. Funnel math in `src/lib/pipeline.ts`.
6. **Sync.** `/api/sync` version stamp polled every 2.5s so other recruiters’ writes refresh the UI without a shared Excel file.
7. **Seed realistic volume.** Four recruiters, three clients, mixed SLA ages, joined and drop-off examples.

## Run locally

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Then open [http://127.0.0.1:3000](http://127.0.0.1:3000) in Chrome. Use **Acting as** in the sidebar to impersonate another recruiter, then try creating `priya.nair@example.com` — create and contact are blocked.

```bash
npm test
npm run build
```

## Production notes

- Move `DATABASE_URL` to Postgres and keep the same Prisma schema.
- Add real auth (Microsoft Entra / Google Workspace) mapped to `Recruiters`.
- Replace poll-based sync with Postgres `LISTEN/NOTIFY` or a socket layer if the desk grows past a handful of concurrent users.
