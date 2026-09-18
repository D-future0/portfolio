"use client";

import { useState } from "react";

export function CancelSubscriptionButton() {
  const [pending, setPending] = useState(false);
  async function cancel() {
    if (!confirm("Cancel this subscription? Your content will remain available.")) return;
    setPending(true);
    const response = await fetch("/api/paystack/cancel", { method: "POST" });
    if (!response.ok) alert((await response.json()).error ?? "Could not cancel subscription.");
    window.location.reload();
  }
  return <button disabled={pending} onClick={cancel} className="text-sm text-red-700 underline disabled:opacity-50">{pending ? "Cancelling..." : "Cancel subscription"}</button>;
}