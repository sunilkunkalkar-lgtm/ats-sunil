import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RECRUITER_COOKIE } from "@/lib/session";

export async function POST(request: Request) {
  const body = (await request.json()) as { recruiterId?: string };
  if (!body.recruiterId) {
    return NextResponse.json({ error: "recruiterId required" }, { status: 400 });
  }
  const recruiter = await prisma.recruiter.findUnique({ where: { id: body.recruiterId } });
  if (!recruiter) {
    return NextResponse.json({ error: "Unknown recruiter" }, { status: 404 });
  }
  const response = NextResponse.json({ ok: true, recruiter });
  response.cookies.set(RECRUITER_COOKIE, recruiter.id, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
