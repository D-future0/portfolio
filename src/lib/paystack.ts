// Paystack server helpers. Paystack has no `trial_days` plan field; the
// documented way to grant a free trial is to set `start_date` on the
// subscription to 30 days out — the first debit then happens a month later.
// Subscriptions also require a card authorization, so the flow is:
//   1. initialize a tokenizing transaction (charges a tiny refundable amount)
//   2. verify it to get the authorization_code
//   3. create the subscription with that authorization + start_date

const BASE = "https://api.paystack.co";

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

async function paystack<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json();
  if (!body.status) {
    throw new Error(body.message ?? `Paystack request failed: ${path}`);
  }
  return body.data as T;
}

export type InitializeTransactionData = {
  reference: string;
  authorization_url: string;
  access_code: string;
};

export async function initializeTransaction(input: {
  email: string;
  amount: number; // smallest currency unit
  currency?: string;
  plan?: string; // Paystack plan code, if subscribing to a plan
  reference?: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}) {
  const reference = input.reference ?? `pf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return paystack<InitializeTransactionData>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: input.amount,
      currency: input.currency ?? "NGN",
      plan: input.plan,
      reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  });
}

export type VerifyTransactionData = {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  customer: { id: number; customer_code: string; email: string };
  authorization: { authorization_code: string; bin: string; last4: string; channel: string } | null;
  plan: { plan_code: string } | null;
  metadata: Record<string, unknown> | null;
};

export async function verifyTransaction(reference: string) {
  return paystack<VerifyTransactionData>(`/transaction/verify/${encodeURIComponent(reference)}`, {
    method: "GET",
  });
}

export type CreateCustomerData = { customer_code: string; email: string };

export async function createCustomer(email: string, name?: string) {
  return paystack<CreateCustomerData>("/customer", {
    method: "POST",
    body: JSON.stringify({ email, name: name ?? email }),
  });
}

export type CreatePlanData = { plan_code: string; name: string; amount: number; interval: string };

export async function createPlan(name: string, amount: number, interval: string, currency = "NGN") {
  return paystack<CreatePlanData>("/plan", {
    method: "POST",
    body: JSON.stringify({ name, amount, interval, currency }),
  });
}

export type CreateSubscriptionData = {
  subscription_code: string;
  status: string;
  customer: { customer_code: string };
  plan: { plan_code: string };
  next_payment_date: string | null;
};

// 30-day free trial: first debit is 30 days from now.
function trialStartDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString();
}

export async function createSubscription(input: {
  customer: string; // email or customer code
  plan: string; // plan code
  authorization: string; // card authorization code
  startDate?: string; // ISO 8601; defaults to +30 days (free trial)
}) {
  return paystack<CreateSubscriptionData>("/subscription", {
    method: "POST",
    body: JSON.stringify({
      customer: input.customer,
      plan: input.plan,
      authorization: input.authorization,
      start_date: input.startDate ?? trialStartDate(),
    }),
  });
}

export type SubscriptionData = {
  subscription_code: string;
  status: string;
  customer: { customer_code: string };
  plan: { plan_code: string };
  next_payment_date: string | null;
  total_payments: number;
};

export async function fetchSubscription(code: string) {
  return paystack<SubscriptionData>(`/subscription/${encodeURIComponent(code)}`, {
    method: "GET",
  });
}

export async function disableSubscription(code: string, token: string) {
  return paystack<{ status: boolean }>("/subscription/disable", {
    method: "POST",
    body: JSON.stringify({ code, token }),
  });
}

export async function listPlans() {
  return paystack<{ plan_code: string; name: string; amount: number; interval: string }[]>(
    "/plan?perPage=50",
    { method: "GET" },
  );
}