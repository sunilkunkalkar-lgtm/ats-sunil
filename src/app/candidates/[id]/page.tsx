import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ActivityForm } from "../../components/ActivityForm";
import { AttachRole } from "../../components/AttachRole";
import { statusLabel } from "@/lib/pipeline";

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [candidate, openRoles] = await Promise.all([
    prisma.candidate.findUnique({
      where: { id },
      include: {
        owner: true,
        applications: { include: { role: { include: { client: true } } } },
        activities: { orderBy: { createdAt: "desc" }, include: { recruiter: true } },
      },
    }),
    prisma.role.findMany({
      where: { status: "OPEN" },
      include: { client: true },
      orderBy: { title: "asc" },
    }),
  ]);
  if (!candidate) notFound();

  return (
    <div>
      <header className="page-head">
        <div>
          <p className="kicker">Owned by {candidate.owner.name}</p>
          <h1>
            {candidate.firstName} {candidate.lastName}
          </h1>
          <p className="lede">
            {candidate.email} · {candidate.phone}
          </p>
        </div>
        <Link className="btn ghost" href="/candidates">
          All candidates
        </Link>
      </header>

      <section className="panel" style={{ marginBottom: 20 }}>
        <h2>Requisitions</h2>
        <ul>
          {candidate.applications.map((app) => (
            <li key={app.id}>
              <Link href={`/roles/${app.roleId}`}>
                {app.role.client.name} · {app.role.title}
              </Link>{" "}
              — {statusLabel(app.status)}
            </li>
          ))}
        </ul>
        <AttachRole candidateId={candidate.id} roles={openRoles} />
      </section>

      <section className="panel">
        <h2>Communication log</h2>
        <ActivityForm candidateId={candidate.id} applicationId={candidate.applications[0]?.id} />
        <ul className="timeline" style={{ marginTop: 16 }}>
          {candidate.activities.map((item) => (
            <li key={item.id}>
              <p className="muted">
                {item.createdAt.toLocaleString()} · {item.recruiter.name} · {item.type}
              </p>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
