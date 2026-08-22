import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { computeOfferJoinFunnel, pct } from "@/lib/pipeline";
import { daysRemaining, slaLabel, slaTone } from "@/lib/sla";

export default async function DashboardPage() {
  const [candidateCount, openRoles, applications, recentActivity] = await Promise.all([
    prisma.candidate.count(),
    prisma.role.findMany({
      where: { status: "OPEN" },
      include: { client: true, owner: true, applications: true },
      orderBy: { openedAt: "asc" },
    }),
    prisma.application.groupBy({ by: ["status"], _count: true }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { recruiter: true, candidate: true },
    }),
  ]);

  const counts = Object.fromEntries(applications.map((a) => [a.status, a._count])) as Record<
    string,
    number
  >;
  const funnel = computeOfferJoinFunnel({
    offered: counts.OFFERED ?? 0,
    accepted: counts.ACCEPTED ?? 0,
    joined: counts.JOINED ?? 0,
    dropoff: counts.OFFER_DROPOFF ?? 0,
  });

  return (
    <div>
      <header className="page-head">
        <div>
          <p className="kicker">Suii desk</p>
          <h1>Talent operations</h1>
          <p className="lede">
            Independent Suii ATS — its own candidate book, 14-day SLA, and offer-to-join funnel.
            This desk does not share records with any other ATS.
          </p>
        </div>
        <Link className="btn" href="/candidates">
          Add candidate
        </Link>
      </header>

      <section className="grid">
        <article className="stat">
          <span className="muted">Candidates</span>
          <strong>{candidateCount}</strong>
        </article>
        <article className="stat">
          <span className="muted">Open requisitions</span>
          <strong>{openRoles.length}</strong>
        </article>
        <article className="stat">
          <span className="muted">Offer → join</span>
          <strong>{pct(funnel.offerToJoinRate)}</strong>
          <span className="muted">{funnel.joined} joined / {funnel.offered} offered</span>
        </article>
        <article className="stat">
          <span className="muted">Offer drop-off</span>
          <strong>{pct(funnel.offerDropoffRate)}</strong>
          <span className="muted">{funnel.dropoff} coded losses</span>
        </article>
      </section>

      <h2 style={{ marginTop: 36 }}>SLA clock</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Client / role</th>
            <th>Priority</th>
            <th>Owner</th>
            <th>Pipeline</th>
            <th>SLA</th>
          </tr>
        </thead>
        <tbody>
          {openRoles.map((role) => {
            const left = daysRemaining(role.openedAt, role.slaDays);
            return (
              <tr key={role.id}>
                <td>
                  <Link href={`/roles/${role.id}`}>
                    {role.client.name} · {role.title}
                  </Link>
                </td>
                <td>{role.priority === "BACKFILL" ? "Backfill" : "New project"}</td>
                <td>{role.owner.name}</td>
                <td>{role.applications.length} in play</td>
                <td>
                  <span className={`pill ${slaTone(left)}`}>{slaLabel(left)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2 style={{ marginTop: 36 }}>Latest communication</h2>
      <ul className="timeline">
        {recentActivity.map((item) => (
          <li key={item.id}>
            <p className="muted">
              {item.createdAt.toLocaleString()} · {item.recruiter.name} · {item.type}
            </p>
            <p>
              <Link href={`/candidates/${item.candidateId}`}>
                {item.candidate.firstName} {item.candidate.lastName}
              </Link>
              {" — "}
              {item.body}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
