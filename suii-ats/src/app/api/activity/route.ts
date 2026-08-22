import { NextResponse } from "next/server";
import { ActivityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRecruiter } from "@/lib/session";

const TYPES: ActivityType[] = ["NOTE", "CALL", "EMAIL", "OUTREACH"];

export async function POST(request: Request) {
  const recruiter = await requireRecruiter();
  const body = (await request.json()) as {
    candidateId?: string;
    applicationId?: string;
    type?: ActivityType;
    body?: string;
  };

  if (!body.candidateId || !body.body?.trim() || !body.type || !TYPES.includes(body.type)) {
    return NextResponse.json({ error: "candidateId, type, and body are required" }, { status: 400 });
  }

  const candidate = await prisma.candidate.findUnique({
    where: { id: body.candidateId },
    include: {
      owner: true,
      activities: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { recruiter: true },
      },
    },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  if (candidate.ownerId !== recruiter.id) {
    const latest = candidate.activities[0];
    return NextResponse.json(
      {
        blocked: true,
        reason: "owned_by_other",
        candidate: {
          id: candidate.id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          phone: candidate.phone,
        },
        owner: candidate.owner,
        latestActivity: latest
          ? {
              id: latest.id,
              type: latest.type,
              body: latest.body,
              createdAt: latest.createdAt,
              recruiterName: latest.recruiter.name,
            }
          : null,
      },
      { status: 409 },
    );
  }

  const activity = await prisma.activityLog.create({
    data: {
      candidateId: candidate.id,
      applicationId: body.applicationId,
      recruiterId: recruiter.id,
      type: body.type,
      body: body.body.trim(),
    },
  });

  return NextResponse.json({ activity }, { status: 201 });
}
