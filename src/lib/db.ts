import { PrismaClient } from "@prisma/client";

function databaseUrlWithTimeout() {
  const value = process.env.DATABASE_URL;
  if (!value) return value;
  const separator = value.includes("?") ? "&" : "?";
  return `${value}${separator}connect_timeout=10&pool_timeout=10`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: databaseUrlWithTimeout(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
