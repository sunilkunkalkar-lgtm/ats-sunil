# Suii ATS

Standalone applicant tracking for the **Suii** talent desk. This is **not** Northline ATS. It has its own database, recruiter sessions (`suii_recruiter_id`), UI, seed data, and port.

Intended GitHub repo: [github.com/sunilkunkalkar-lgtm/suii-ats-](https://github.com/sunilkunkalkar-lgtm/suii-ats-)

## What is different from Northline

| | Northline ATS | Suii ATS |
| --- | --- | --- |
| Location | repo root | `suii-ats/` |
| Port | 3000 | **3002** |
| Session cookie | `ats_recruiter_id` | `suii_recruiter_id` |
| Database | `prisma/dev.db` in the root app | `suii-ats/prisma/dev.db` |
| SLA | 21 days | 14 days |
| Brand / seed | Northline staff | Suii team (`@suii.team`) |

Do not point both apps at the same `DATABASE_URL`.

## Open in Chrome (Windows)

1. Install Node.js LTS from https://nodejs.org.
2. Open the **`suii-ats`** folder (not the Northline root).
3. Double-click **`start-suii.bat`**. Leave that window open.
4. Chrome should open **http://127.0.0.1:3002**. Use `http`, never `https`.

## Run locally

```bash
cd suii-ats
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://127.0.0.1:3002](http://127.0.0.1:3002). Switch recruiter with **Acting as**, then try creating `kira.bose@example.com` — create and contact are blocked.

From the Northline repo root you can also run `npm run suii:dev` after installing in `suii-ats/`.

```bash
npm test
npm run build
```

## Product rules

Same operational model as a recruiting desk, implemented only for Suii:

1. One candidate record, unique email and phone.
2. Only the owner may log contact; duplicates return owner + last activity.
3. 14-day SLA from requisition `openedAt`.
4. Kanban pipeline with coded offer drop-off.
5. Live client reports and CSV export.
6. `/api/sync` poll so other Suii recruiters see writes without a shared spreadsheet.
