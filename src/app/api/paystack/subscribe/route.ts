import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSubscription, fetchSubscription } from "@/lib/paystack";
import { auth } from "@/lib/auth";
import { clientKey, limitedResponse, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limit = await rateLimit(clientKey(request, "payment-subscribe"), 5, 60 * 60 * 1000);
  if (!limit.allowed) return limitedResponse(limit.resetAt);
  const session = await auth();
  if (!session?.user?.tenantId || session.user.role !== "TENANT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { authorization, startDate, planKey } = body as {
    planKey?: string;
    authorization?: string;
    startDate?: string;
  };

  if (!authorization || !planKey) {
    return NextResponse.json(
      { error: "tenantId, customer, plan, and authorization are required." },
      { status: 400 },
    );
  }

  try {
    const tenant = await db.tenant.findUnique({ where: { id: session.user.tenantId } });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    }
    if (tenant.paystackSubscriptionCode) {
      return NextResponse.json({ error: "Workspace already has a subscription." }, { status: 409 });
    }

    const selectedPlan = await db.plan.findUnique({ where: { key: planKey } });
    if (!selectedPlan?.paystackPlanCode) return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
    const sub = await createSubscription({ customer: session.user.email!, plan: selectedPlan.paystackPlanCode, authorization, startDate });

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);

    await db.subscription.create({
      data: {
        tenantId: tenant.id,
        paystackCustomerCode: sub.customer.customer_code,
        paystackSubscriptionCode: sub.subscription_code,
        paystackEmailToken: sub.email_token,
        paystackAuthorizationCode: authorization,
        planCode: selectedPlan.key,
        status: sub.status,
        trialEndsAt,
      },
    });

    await db.tenant.update({
      where: { id: tenant.id },
      data: {
        plan: "PRO",
        paystackCustomerCode: sub.customer.customer_code,
        paystackSubscriptionCode: sub.subscription_code,
        paystackSubscriptionStatus: sub.status,
        trialEndsAt,
      },
    });

    return NextResponse.json({ ok: true, subscriptionCode: sub.subscription_code });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not create subscription." },
      { status: 502 },
    );
  }
}