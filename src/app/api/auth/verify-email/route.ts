import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/auth-tokens";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token required." }, { status: 400 });
  const record = await db.authToken.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
  if (!record || record.purpose !== "verify_email" || record.usedAt || record.expiresAt <= new Date()) return NextResponse.json({ error: "Verification link is invalid or expired." }, { status: 400 });
  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } }),
    db.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);
  return NextResponse.redirect(new URL("/admin/login?verified=1", request.url));
}