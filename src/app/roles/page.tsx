import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RoleForm } from "../components/RoleForm";
import { daysRemaining, slaLabel, slaTone } from "@/lib/sla";

export default async function RolesPage() {
  const roles = await prisma.role.findMany({
    include: { client: true, owner: true, applications: true },
    orderBy: { openedAt: "asc" },
  });

  return (
    <div>
      <header className="page-head">
        <div>
          <p className="kicker">Requisitions</p>
          <h1>Open roles & SLA</h1>
          <p className="lede">
            Every seat is tagged by client, role, and New project vs Backfill, with a 3-week
            countdown from open date.
          </p>
        </div>
      </header>
      <table className="table">
        <thead>
          <tr>
            <th>Role</th>
            <th>Priority</th>
            <th>Headcount</th>
            <th>Owner</th>
            <th>Days remaining</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => {
            const left = daysRemaining(role.openedAt, role.slaDays);
            return (
              <tr key={role.id}>
                <td>
                  <Link href={`/roles/${role.id}`}>
                    {role.client.name} · {role.title}
                  </Link>
                </td>
                <td>{role.priority === "BACKFILL" ? "Backfill" : "New project"}</td>
                <td>{role.headcount}</td>
                <td>{role.owner.name}</td>
                <td>
                  <span className={`pill ${slaTone(left)}`}>{slaLabel(left)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop: 28 }}>
        <RoleForm />
      </div>
    </div>
  );
}
