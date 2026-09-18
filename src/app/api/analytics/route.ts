import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.tenantId !== "string" || typeof body.type !== "string") {
    return NextResponse.json({ error: "Invalid event." }, { status: 400 });
  }
  const allowed = new Set(["view", "contact", "link_click", "project_view"]);
  if (!allowed.has(body.type)) return NextResponse.json({ error: "Invalid event." }, { status: 400 });
  const forwarded = request.headers.get("x-forwarded-for") ?? "anonymous";
  const sessionHash = createHash("sha256").update(`${forwarded}:${request.headers.get("user-agent") ?? ""}`).digest("hex");
  await db.analyticsEvent.create({
    data: {
      tenantId: body.tenantId,
      type: body.type,
      path: typeof body.path === "string" ? body.path.slice(0, 300) : null,
      target: typeof body.target === "string" ? body.target.slice(0, 300) : null,
      projectId: typeof body.projectId === "string" ? body.projectId : null,
      sessionHash,
    },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}