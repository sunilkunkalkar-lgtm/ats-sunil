import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CandidateForm } from "../../components/CandidateForm";
import { daysRemaining, slaLabel, slaTone } from "@/lib/sla";
import { PIPELINE_COLUMNS, statusLabel } from "@/lib/pipeline";

export default async function RoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      client: true,
      owner: true,
      applications: {
        include: { candidate: { include: { owner: true } } },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
  if (!role) notFound();

  const left = daysRemaining(role.openedAt, role.slaDays);
  const counts = Object.fromEntries(PIPELINE_COLUMNS.map((c) => [c.status, 0])) as Record<string, number>;
  for (const app of role.applications) counts[app.status] += 1;

  return (
    <div>
      <header className="page-head">
        <div>
          <p className="kicker">{role.client.name}</p>
          <h1>{role.title}</h1>
          <p className="lede">
            {role.priority === "BACKFILL" ? "Backfill" : "New project"} · owned by {role.owner.name} ·{" "}
            <span className={`pill ${slaTone(left)}`}>{slaLabel(left)}</span>
          </p>
        </div>
        <Link className="btn ghost" href="/roles">
          All requisitions
        </Link>
      </header>

      <p className="lede" style={{ marginBottom: 20 }}>
        {role.title}: {PIPELINE_COLUMNS.filter((c) => counts[c.status]).map((c) => `${counts[c.status]} ${statusLabel(c.status).toLowerCase()}`).join(", ") || "no candidates yet"}
      </p>

      <table className="table">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Owner</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {role.applications.map((app) => (
            <tr key={app.id}>
              <td>
                <Link href={`/candidates/${app.candidateId}`}>
                  {app.candidate.firstName} {app.candidate.lastName}
                </Link>
              </td>
              <td>{app.candidate.owner.name}</td>
              <td>{statusLabel(app.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="panel" style={{ marginTop: 28 }}>
        <h2>Source a candidate onto this role</h2>
        <CandidateForm defaultRoleId={role.id} />
      </div>
    </div>
  );
}
