import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAuthToken, sendAuthEmail } from "@/lib/auth-tokens";
import { passwordResetRequestSchema } from "@/lib/validation";
import { clientKey, limitedResponse, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limit = await rateLimit(clientKey(request, "password-reset"), 5, 60 * 60 * 1000);
  if (!limit.allowed) return limitedResponse(limit.resetAt);
  const parsed = passwordResetRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: true });
  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (user) await sendAuthEmail(user.email, await createAuthToken(user.id, "reset_password"), "reset_password");
  return NextResponse.json({ ok: true });
}