"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    await fetch("/api/auth/request-password-reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setSent(true);
  }
  return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6"><h1 className="font-display text-3xl italic text-ink">Reset your password</h1>{sent ? <p className="mt-4 text-ink-soft">If an account exists for that email, a reset link is on its way.</p> : <form onSubmit={submit} className="mt-8 flex flex-col gap-4"><input name="email" type="email" required placeholder="Email address" className="border border-line bg-paper-raised px-3 py-2" /><button className="border border-ink bg-ink px-5 py-2.5 text-sm text-paper">Send reset link</button></form>}<Link href="/admin/login" className="mt-6 text-sm text-ink underline">Back to sign in</Link></main>;
}