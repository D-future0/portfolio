import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/auth-tokens";
import { passwordResetSchema } from "@/lib/validation";
import { clientKey, limitedResponse, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limit = await rateLimit(clientKey(request, "password-reset-complete"), 10, 60 * 60 * 1000);
  if (!limit.allowed) return limitedResponse(limit.resetAt);
  const parsed = passwordResetSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid reset request." }, { status: 400 });
  const record = await db.authToken.findUnique({ where: { tokenHash: hashToken(parsed.data.token) } });
  if (!record || record.purpose !== "reset_password" || record.usedAt || record.expiresAt <= new Date()) return NextResponse.json({ error: "Reset link is invalid or expired." }, { status: 400 });
  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) } }),
    db.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);
  return NextResponse.json({ ok: true });
}