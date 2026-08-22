import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const RECRUITER_COOKIE = "suii_recruiter_id";

export async function getCurrentRecruiter() {
  const store = await cookies();
  const id = store.get(RECRUITER_COOKIE)?.value;
  if (!id) {
    const first = await prisma.recruiter.findFirst({ orderBy: { name: "asc" } });
    return first;
  }
  const recruiter = await prisma.recruiter.findUnique({ where: { id } });
  if (recruiter) return recruiter;
  return prisma.recruiter.findFirst({ orderBy: { name: "asc" } });
}

export async function requireRecruiter() {
  const recruiter = await getCurrentRecruiter();
  if (!recruiter) {
    throw new Error("No recruiters seeded. Run npm run db:seed.");
  }
  return recruiter;
}
