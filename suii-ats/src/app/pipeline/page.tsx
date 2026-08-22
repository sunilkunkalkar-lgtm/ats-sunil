import { prisma } from "@/lib/prisma";
import { Kanban } from "../components/Kanban";

export default async function PipelinePage() {
  const applications = await prisma.application.findMany({
    include: {
      candidate: { include: { owner: true } },
      role: { include: { client: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <header className="page-head">
        <div>
          <p className="kicker">Suii pipeline</p>
          <h1>Board</h1>
          <p className="lede">
            Suii-only applications. Drag Sourced → Joined. Offer drop-off always needs a reason code.
          </p>
        </div>
      </header>
      <Kanban applications={applications} />
    </div>
  );
}
