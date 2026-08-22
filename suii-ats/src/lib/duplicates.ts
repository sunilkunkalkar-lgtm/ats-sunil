import { ActivityType, Prisma, PrismaClient } from "@prisma/client";
import { normalizeEmail, normalizePhone } from "./identity";

export type DuplicateConflict = {
  blocked: true;
  reason: "email" | "phone" | "email_and_phone";
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  owner: { id: string; name: string; email: string };
  latestActivity: {
    id: string;
    type: ActivityType;
    body: string;
    createdAt: Date;
    recruiterName: string;
  } | null;
};

const candidateInclude = {
  owner: { select: { id: true, name: true, email: true } },
  activities: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    include: { recruiter: { select: { name: true } } },
  },
};

export async function findDuplicateCandidate(
  db: PrismaClient | Prisma.TransactionClient,
  email: string,
  phone: string,
) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);

  const matches = await db.candidate.findMany({
    where: {
      OR: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    },
    include: candidateInclude,
  });

  if (matches.length === 0) return null;

  const emailHit = matches.find((c) => c.email === normalizedEmail);
  const phoneHit = matches.find((c) => c.phone === normalizedPhone);
  const candidate = emailHit ?? phoneHit ?? matches[0];

  let reason: DuplicateConflict["reason"] = "email";
  if (emailHit && phoneHit && emailHit.id === phoneHit.id) {
    reason = "email_and_phone";
  } else if (phoneHit && !emailHit) {
    reason = "phone";
  } else if (emailHit && phoneHit && emailHit.id !== phoneHit.id) {
    reason = "email_and_phone";
  }

  const latest = candidate.activities[0] ?? null;

  const conflict: DuplicateConflict = {
    blocked: true,
    reason,
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
  };

  return conflict;
}

export async function recordDuplicateBlock(
  db: PrismaClient | Prisma.TransactionClient,
  conflict: DuplicateConflict,
  recruiterId: string,
) {
  await db.activityLog.create({
    data: {
      candidateId: conflict.candidate.id,
      recruiterId,
      type: "DUPLICATE_BLOCK",
      body: `Blocked duplicate ${conflict.reason} attempt. Owner remains ${conflict.owner.name}.`,
    },
  });
}
