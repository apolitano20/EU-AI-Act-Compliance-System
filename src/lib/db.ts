import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function createPrisma() {
  // DATABASE_FILE is set by Electron main for packaged app (absolute path in userData).
  // Otherwise use DATABASE_URL from env (dev / seed).
  const dbFile = process.env.DATABASE_FILE;
  const url = dbFile ? `file:${dbFile}` : (process.env.DATABASE_URL ?? "file:./dev.db");
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? createPrisma();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
