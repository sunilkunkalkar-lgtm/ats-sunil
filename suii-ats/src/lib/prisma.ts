import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { suiiPrisma?: PrismaClient };

export const prisma =
  globalForPrisma.suiiPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.suiiPrisma = prisma;
}
