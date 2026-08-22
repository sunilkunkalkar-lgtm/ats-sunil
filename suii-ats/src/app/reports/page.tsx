import { prisma } from "@/lib/prisma";
import { ClientReport } from "../components/ClientReport";
import { computeOfferJoinFunnel, DROPOFF_REASONS, pct } from "@/lib/pipeline";

export default async function ReportsPage() {
  const [roles, clients, applications, dropoffs] = await Promise.all([
    prisma.role.findMany({
      include: { client: true, applications: true },
      orderBy: [{ client: { name: "asc" } }, { title: "asc" }],
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.application.groupBy({ by: ["status"], _count: true }),
    prisma.application.groupBy({
      by: ["dropoffReason"],
      where: { status: "OFFER_DROPOFF" },
      _count: true,
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

  const rows = roles.map((role) => {
    const byStatus = {
      SOURCED: 0,
      CONTACTED: 0,
      INTERVIEWING: 0,
      OFFERED: 0,
      ACCEPTED: 0,
      JOINED: 0,
      OFFER_DROPOFF: 0,
    };
    for (const app of role.applications) byStatus[app.status] += 1;
    const summaryParts = Object.entries(byStatus)
      .filter(([, n]) => n > 0)
      .map(([status, n]) => `${n} ${status.toLowerCase().replaceAll("_", " ")}`);
    return {
      client: role.client.name,
      role: role.title,
      priority: role.priority,
      summary: summaryParts.join(", "),
      ...byStatus,
    };
  });

  return (
    <div>
      <header className="page-head">
        <div>
          <p className="kicker">Live reporting</p>
          <h1>Client status in seconds</h1>
          <p className="lede">
            Filter a client, copy the live line, or export CSV. The funnel below is offer-extended
            through joined — including accepted-not-yet-started and coded drop-offs.
          </p>
        </div>
      </header>

      <ClientReport rows={rows} clients={clients} />

      <section className="panel" style={{ marginTop: 20 }}>
        <h2>Offer → join funnel</h2>
        <div className="grid">
          <article className="stat">
            <span className="muted">Offer cohort</span>
            <strong>{funnel.offered}</strong>
          </article>
          <article className="stat">
            <span className="muted">Joined</span>
            <strong>{pct(funnel.offerToJoinRate)}</strong>
          </article>
          <article className="stat">
            <span className="muted">Drop-off</span>
            <strong>{pct(funnel.offerDropoffRate)}</strong>
          </article>
          <article className="stat">
            <span className="muted">Accepted, not joined</span>
            <strong>{funnel.acceptedPending}</strong>
          </article>
        </div>
        <table className="table" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Drop-off reason</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {DROPOFF_REASONS.map((reason) => {
              const row = dropoffs.find((d) => d.dropoffReason === reason.value);
              return (
                <tr key={reason.value}>
                  <td>{reason.label}</td>
                  <td>{row?._count ?? 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
