"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function ResetPasswordForm() {
  const params = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password");
    const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: params.get("token"), password }) });
    setMessage(response.ok ? "Password updated. You can sign in now." : (await response.json()).error ?? "Reset failed.");
  }
  return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6"><h1 className="font-display text-3xl italic text-ink">Set a new password</h1><form onSubmit={submit} className="mt-8 flex flex-col gap-4"><input name="password" type="password" minLength={8} required placeholder="New password" className="border border-line bg-paper-raised px-3 py-2" /><button className="border border-ink bg-ink px-5 py-2.5 text-sm text-paper">Update password</button></form>{message ? <p className="mt-4 text-sm text-ink-soft">{message}</p> : null}</main>;
}

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><ResetPasswordForm /></Suspense>;
}