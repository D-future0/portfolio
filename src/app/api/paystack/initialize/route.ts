import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { initializeTransaction, verifyTransaction } from "@/lib/paystack";
import { db } from "@/lib/db";
import { clientKey, limitedResponse, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limit = await rateLimit(clientKey(request, "payment-init"), 10, 60 * 60 * 1000);
  if (!limit.allowed) return limitedResponse(limit.resetAt);
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { reference, tenantId, planKey } = body as {
    reference?: string;
    tenantId?: string;
    planKey?: string;
  };

  if (session.user.role !== "TENANT" || !session.user.tenantId || tenantId !== session.user.tenantId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!planKey) return NextResponse.json({ error: "Plan is required." }, { status: 400 });
  const plan = await db.plan.findUnique({ where: { key: planKey } });
  if (!plan || plan.amount <= 0 || !plan.paystackPlanCode) {
    return NextResponse.json({ error: "Selected plan is not configured." }, { status: 503 });
  }

  try {
    const result = await initializeTransaction({
      email: session.user.email!,
      amount: plan.amount,
      currency: plan.currency,
      plan: plan.paystackPlanCode,
      reference,
      callbackUrl: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/dashboard/billing`,
      metadata: { userId: session.user.id, tenantId, planKey, purpose: "pro_upgrade" },
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not start payment." },
      { status: 502 },
    );
  }
}