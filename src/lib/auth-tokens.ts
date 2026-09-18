import { createHash, randomBytes } from "node:crypto";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createAuthToken(userId: string, purpose: "verify_email" | "reset_password") {
  const token = randomBytes(32).toString("hex");
  await db.authToken.deleteMany({ where: { userId, purpose } });
  await db.authToken.create({ data: { userId, purpose, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
  return token;
}

export async function sendAuthEmail(to: string, token: string, purpose: "verify_email" | "reset_password") {
  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const path = purpose === "verify_email" ? "/verify-email" : "/reset-password";
  const subject = purpose === "verify_email" ? "Verify your email address" : "Reset your password";
  const text = `${subject}: ${baseUrl}${path}?token=${token}`;
  if (!process.env.RESEND_API_KEY) {
    logger.warn("Auth email not sent because RESEND_API_KEY is missing", { purpose });
    return;
  }
  await new Resend(process.env.RESEND_API_KEY).emails.send({ from: process.env.CONTACT_FROM_EMAIL ?? "portfolio@resend.dev", to, subject, text });
}