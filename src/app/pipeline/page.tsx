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
          <p className="kicker">Workflow</p>
          <h1>Pipeline board</h1>
          <p className="lede">
            Drag a card across Sourced → Joined. Moving into Offer drop-off requires a reason code
            so attrition is no longer a mystery.
          </p>
        </div>
      </header>
      <Kanban applications={applications} />
    </div>
  );
}
