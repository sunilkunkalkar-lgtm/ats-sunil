import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRecruiter } from "@/lib/session";

export async function POST(request: Request) {
  const recruiter = await requireRecruiter();
  const body = (await request.json()) as { candidateId?: string; roleId?: string };

  if (!body.candidateId || !body.roleId) {
    return NextResponse.json({ error: "candidateId and roleId required" }, { status: 400 });
  }

  const candidate = await prisma.candidate.findUnique({ where: { id: body.candidateId } });
  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }
  if (candidate.ownerId !== recruiter.id) {
    return NextResponse.json(
      { error: "Only the candidate owner can attach this person to a requisition." },
      { status: 409 },
    );
  }

  try {
    const application = await prisma.application.create({
      data: {
        candidateId: body.candidateId,
        roleId: body.roleId,
        recruiterId: recruiter.id,
        activities: {
          create: {
            candidateId: body.candidateId,
            recruiterId: recruiter.id,
            type: "STATUS_CHANGE",
            body: "Sourced onto requisition.",
          },
        },
      },
      include: {
        candidate: { include: { owner: true } },
        role: { include: { client: true } },
      },
    });
    return NextResponse.json({ application }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Candidate is already on this requisition." }, { status: 409 });
  }
}
