import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.tenantId || session.user.role !== "TENANT") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const hostname = typeof body?.hostname === "string" ? body.hostname.trim().toLowerCase() : "";
  if (!/^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(hostname)) return NextResponse.json({ error: "Enter a valid domain." }, { status: 400 });
  const domain = await db.customDomain.create({ data: { tenantId: session.user.tenantId, hostname, verificationToken: randomBytes(24).toString("hex") } });
  return NextResponse.json({ ok: true, hostname: domain.hostname, verificationToken: domain.verificationToken }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.tenantId || session.user.role !== "TENANT") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (typeof body?.hostname !== "string") return NextResponse.json({ error: "Domain is required." }, { status: 400 });
  await db.customDomain.deleteMany({ where: { tenantId: session.user.tenantId, hostname: body.hostname.toLowerCase() } });
  return NextResponse.json({ ok: true });
}