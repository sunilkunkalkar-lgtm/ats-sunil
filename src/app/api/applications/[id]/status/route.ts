import { DropoffReason, PipelineStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRecruiter } from "@/lib/session";
import { statusLabel } from "@/lib/pipeline";

const STATUSES: PipelineStatus[] = [
  "SOURCED",
  "CONTACTED",
  "INTERVIEWING",
  "OFFERED",
  "ACCEPTED",
  "JOINED",
  "OFFER_DROPOFF",
];

const REASONS: DropoffReason[] = [
  "COUNTER_OFFER",
  "GHOSTED",
  "SALARY_MISMATCH",
  "ACCEPTED_ELSEWHERE",
  "PERSONAL",
  "OTHER",
];

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const recruiter = await requireRecruiter();
  const { id } = await context.params;
  const body = (await request.json()) as {
    status?: PipelineStatus;
    dropoffReason?: DropoffReason;
    dropoffNotes?: string;
  };

  if (!body.status || !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Valid status required" }, { status: 400 });
  }
  if (body.status === "OFFER_DROPOFF") {
    if (!body.dropoffReason || !REASONS.includes(body.dropoffReason)) {
      return NextResponse.json({ error: "Drop-off reason code is required" }, { status: 400 });
    }
  }

  const existing = await prisma.application.findUnique({
    where: { id },
    include: { candidate: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const application = await prisma.application.update({
    where: { id },
    data: {
      status: body.status,
      dropoffReason: body.status === "OFFER_DROPOFF" ? body.dropoffReason : null,
      dropoffNotes: body.status === "OFFER_DROPOFF" ? body.dropoffNotes?.trim() || null : null,
      activities: {
        create: {
          candidateId: existing.candidateId,
          recruiterId: recruiter.id,
          type: "STATUS_CHANGE",
          body:
            body.status === "OFFER_DROPOFF"
              ? `Offer drop-off: ${body.dropoffReason}${body.dropoffNotes ? ` — ${body.dropoffNotes}` : ""}`
              : `Moved to ${statusLabel(body.status)}.`,
        },
      },
    },
    include: {
      candidate: { include: { owner: true } },
      role: { include: { client: true } },
    },
  });

  return NextResponse.json({ application });
}
