import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRecruiter } from "@/lib/session";
import { isValidEmail, isValidPhone, normalizeEmail, normalizePhone } from "@/lib/identity";
import { findDuplicateCandidate, recordDuplicateBlock } from "@/lib/duplicates";

export async function GET() {
  const candidates = await prisma.candidate.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      owner: true,
      activities: { orderBy: { createdAt: "desc" }, take: 1, include: { recruiter: true } },
      applications: { include: { role: { include: { client: true } } } },
    },
  });
  return NextResponse.json({ candidates });
}

export async function POST(request: Request) {
  const recruiter = await requireRecruiter();
  const body = (await request.json()) as {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };

  const firstName = body.firstName?.trim() ?? "";
  const lastName = body.lastName?.trim() ?? "";
  const email = body.email ?? "";
  const phone = body.phone ?? "";

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: "Valid phone is required" }, { status: 400 });
  }

  const conflict = await findDuplicateCandidate(prisma, email, phone);
  if (conflict) {
    await recordDuplicateBlock(prisma, conflict, recruiter.id);
    return NextResponse.json(conflict, { status: 409 });
  }

  const candidate = await prisma.candidate.create({
    data: {
      firstName,
      lastName,
      email: normalizeEmail(email),
      phone: normalizePhone(phone),
      ownerId: recruiter.id,
      activities: {
        create: {
          recruiterId: recruiter.id,
          type: "NOTE",
          body: `Candidate created and owned by ${recruiter.name}.`,
        },
      },
    },
    include: { owner: true },
  });

  return NextResponse.json({ candidate }, { status: 201 });
}
