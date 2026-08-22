import { NextResponse } from "next/server";
import { RolePriority } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRecruiter } from "@/lib/session";

const PRIORITIES: RolePriority[] = ["NEW_PROJECT", "BACKFILL"];

export async function POST(request: Request) {
  const recruiter = await requireRecruiter();
  const body = (await request.json()) as {
    title?: string;
    clientName?: string;
    priority?: RolePriority;
    headcount?: number;
  };

  const title = body.title?.trim() ?? "";
  const clientName = body.clientName?.trim() ?? "";
  if (!title || !clientName) {
    return NextResponse.json({ error: "Title and client are required" }, { status: 400 });
  }
  if (!body.priority || !PRIORITIES.includes(body.priority)) {
    return NextResponse.json({ error: "Priority is required" }, { status: 400 });
  }

  const client = await prisma.client.upsert({
    where: { name: clientName },
    update: {},
    create: { name: clientName },
  });

  const role = await prisma.role.create({
    data: {
      title,
      clientId: client.id,
      priority: body.priority,
      headcount: Math.max(1, Number(body.headcount) || 1),
      ownerId: recruiter.id,
    },
    include: { client: true, owner: true },
  });

  return NextResponse.json({ role }, { status: 201 });
}
