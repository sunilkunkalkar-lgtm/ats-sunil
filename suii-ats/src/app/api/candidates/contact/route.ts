import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRecruiter } from "@/lib/session";
import { isValidEmail, isValidPhone } from "@/lib/identity";
import { findDuplicateCandidate, recordDuplicateBlock } from "@/lib/duplicates";

/**
 * Attempt to log outreach against email/phone. Hard-blocks if the person
 * already exists — even for the owner this endpoint is a lookup gate used
 * before first contact. Owners should use /api/activity instead.
 */
export async function POST(request: Request) {
  const recruiter = await requireRecruiter();
  const body = (await request.json()) as {
    email?: string;
    phone?: string;
    message?: string;
  };

  if (!body.email || !isValidEmail(body.email) || !body.phone || !isValidPhone(body.phone)) {
    return NextResponse.json({ error: "Email and phone are required" }, { status: 400 });
  }

  const conflict = await findDuplicateCandidate(prisma, body.email, body.phone);
  if (conflict) {
    await recordDuplicateBlock(prisma, conflict, recruiter.id);
    return NextResponse.json(conflict, { status: 409 });
  }

  return NextResponse.json({
    blocked: false,
    message: "No existing candidate. Safe to create and contact.",
  });
}
