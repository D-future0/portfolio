import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { initializeTransaction, verifyTransaction } from "@/lib/paystack";

export async function POST(request: Request) {
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

  const { reference, tenantId } = body as {
    reference?: string;
    tenantId?: string;
  };

  if (session.user.role !== "TENANT" || !session.user.tenantId || tenantId !== session.user.tenantId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await initializeTransaction({
      email: session.user.email!,
      amount: 5000,
      currency: "NGN",
      plan: process.env.PAYSTACK_PRO_PLAN_CODE,
      reference,
      callbackUrl: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/dashboard/billing`,
      metadata: { userId: session.user.id, tenantId, purpose: "pro_upgrade" },
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not start payment." },
      { status: 502 },
    );
  }
}