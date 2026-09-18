"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Paystack upgrade flow. Paystack has no `trial_days` plan field, so the
// 30-day free trial is granted by setting `start_date` to +30 days when
// creating the subscription — the first real charge happens a month later.
// Subscriptions also require a card authorization, so we first initialize a
// tokenizing transaction, verify it, then create the subscription.
export function UpgradeButton({
  tenantId,
  planKey,
  label,
}: {
  tenantId: string;
  planKey: string;
  label: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function upgrade() {
    setPending(true);
    setError(null);
    try {
      // 1. Initialize a tokenizing transaction.
      const initRes = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          planKey,
        }),
      });
      const init = await initRes.json();
      if (!initRes.ok || !init.authorization_url) {
        throw new Error(init.error ?? "Could not start payment.");
      }

      // 2. Send the owner to Paystack's hosted checkout.
      window.location.href = init.authorization_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        disabled={pending}
        onClick={upgrade}
        className="w-fit border border-ink bg-ink px-5 py-2.5 text-sm text-paper transition-colors hover:bg-transparent hover:text-ink disabled:opacity-50"
      >
        {pending ? "Redirecting to Paystack…" : label}
      </button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}