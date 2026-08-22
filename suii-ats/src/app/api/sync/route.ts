import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [candidate, application, activity, role] = await Promise.all([
    prisma.candidate.aggregate({ _max: { updatedAt: true } }),
    prisma.application.aggregate({ _max: { updatedAt: true } }),
    prisma.activityLog.aggregate({ _max: { createdAt: true } }),
    prisma.role.aggregate({ _max: { createdAt: true } }),
  ]);

  const stamps = [
    candidate._max.updatedAt,
    application._max.updatedAt,
    activity._max.createdAt,
    role._max.createdAt,
  ]
    .filter(Boolean)
    .map((d) => d!.getTime());

  const version = stamps.length ? Math.max(...stamps) : 0;
  return NextResponse.json({ version });
}
