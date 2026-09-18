import { NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { clientKey, limitedResponse, rateLimit } from "@/lib/rate-limit";

// Verifies a Paystack transaction after the customer returns from checkout.
// On success, records the card authorization so we can create a subscription.
export async function POST(request: Request) {
  const limit = await rateLimit(clientKey(request, "payment-verify"), 20, 60 * 60 * 1000);
  if (!limit.allowed) return limitedResponse(limit.resetAt);
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "TENANT" || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { reference } = body as { reference?: string };
  if (!reference) {
    return NextResponse.json({ error: "Reference required." }, { status: 400 });
  }

  try {
    const data = await verifyTransaction(reference);
    const metadata = data.metadata ?? {};
    if (data.status !== "success" || metadata.userId !== session.user.id || metadata.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: "Transaction does not belong to this workspace." }, { status: 403 });
    }
    return NextResponse.json({
      ok: data.status === "success",
      reference: data.reference,
      status: data.status,
      authorizationCode: data.authorization?.authorization_code ?? null,
      customerCode: data.customer?.customer_code ?? null,
      planCode: data.plan?.plan_code ?? null,
      metadata,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Verification failed." },
      { status: 502 },
    );
  }
}