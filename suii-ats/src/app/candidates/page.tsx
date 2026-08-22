import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CandidateForm } from "../components/CandidateForm";
import { ContactGate } from "../components/ContactGate";

export default async function CandidatesPage() {
  const candidates = await prisma.candidate.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      owner: true,
      applications: { include: { role: { include: { client: true } } } },
    },
  });

  return (
    <div>
      <header className="page-head">
        <div>
          <p className="kicker">Single source of truth</p>
          <h1>Candidates</h1>
          <p className="lede">
            Hard unique email and phone. Create or contact attempts against an existing identity are
            blocked and show the owner plus last communication.
          </p>
        </div>
      </header>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email / phone</th>
            <th>Owner</th>
            <th>Active roles</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c.id}>
              <td>
                <Link href={`/candidates/${c.id}`}>
                  {c.firstName} {c.lastName}
                </Link>
              </td>
              <td>
                {c.email}
                <div className="muted">{c.phone}</div>
              </td>
              <td>{c.owner.name}</td>
              <td>
                {c.applications.map((a) => `${a.role.client.name} ${a.role.title}`).join(", ") || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid-2" style={{ marginTop: 28, alignItems: "start" }}>
        <section className="panel">
          <h2>New candidate</h2>
          <CandidateForm />
        </section>
        <ContactGate />
      </div>
    </div>
  );
}
