import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHmac, timingSafeEqual } from "node:crypto";

// Paystack webhook endpoint. Paystack is the source of truth for billing;
// we mirror events here so feature-gating works without an API call per page.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!signature || !secret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const event = JSON.parse(rawBody);
  if (!event || !event.event || !event.data) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const eventType: string = event.event;
  const data: any = event.data;

  try {
    const code: string | undefined = data.subscription_code ?? data.code;

    if (
      eventType === "subscription.create" ||
      eventType === "subscription.active" ||
      eventType === "subscription.success"
    ) {
      if (code) {
        const tenant = await db.tenant.findFirst({ where: { paystackSubscriptionCode: code } });
        if (tenant) {
          await db.tenant.update({
            where: { id: tenant.id },
            data: {
              paystackSubscriptionStatus: data.status ?? "active",
              trialEndsAt: data.next_payment_date ? new Date(data.next_payment_date) : tenant.trialEndsAt,
            },
          });
        }
      }
    } else if (eventType === "subscription.disable") {
      if (code) {
        const tenant = await db.tenant.findFirst({ where: { paystackSubscriptionCode: code } });
        if (tenant) {
          await db.tenant.update({
            where: { id: tenant.id },
            data: { paystackSubscriptionStatus: "canceled" },
          });
        }
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Paystack webhook handling failed:", err);
    return NextResponse.json({ error: "Webhook handling failed." }, { status: 500 });
  }
}