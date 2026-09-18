import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { disableSubscription } from "@/lib/paystack";

export async function POST() {
  const session = await auth();
  if (!session?.user?.tenantId || session.user.role !== "TENANT") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenant = await db.tenant.findUnique({ where: { id: session.user.tenantId }, include: { subscriptions: { where: { status: { not: "canceled" } }, orderBy: { createdAt: "desc" }, take: 1 } } });
  const subscription = tenant?.subscriptions[0];
  if (!tenant || !subscription?.paystackSubscriptionCode || !subscription.paystackEmailToken) return NextResponse.json({ error: "No cancellable subscription found." }, { status: 404 });
  await disableSubscription(subscription.paystackSubscriptionCode, subscription.paystackEmailToken);
  await db.$transaction([
    db.subscription.update({ where: { id: subscription.id }, data: { status: "canceled", endsAt: new Date() } }),
    db.tenant.update({ where: { id: tenant.id }, data: { paystackSubscriptionStatus: "canceled" } }),
  ]);
  return NextResponse.json({ ok: true });
}