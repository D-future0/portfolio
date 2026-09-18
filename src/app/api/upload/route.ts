import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isTrialActive } from "@/lib/trial";
import { clientKey, limitedResponse, rateLimit } from "@/lib/rate-limit";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/avif"];

export async function POST(request: Request) {
  const limit = await rateLimit(clientKey(request, "upload"), 20, 60 * 60 * 1000);
  if (!limit.allowed) return limitedResponse(limit.resetAt);
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "TENANT" && session.user.tenantId) {
    const tenant = await db.tenant.findUnique({ where: { id: session.user.tenantId }, select: { plan: true, trialEndsAt: true } });
    if (!tenant || !isTrialActive(tenant)) {
      return NextResponse.json({ error: "Your trial has ended. Upgrade to upload images." }, { status: 402 });
    }
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only PNG, JPEG, WebP, or AVIF images are allowed." },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be smaller than 5MB." },
      { status: 400 },
    );
  }

  const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return NextResponse.json({ url: blob.url });
}
