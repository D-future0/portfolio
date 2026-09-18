"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { registerTenant } from "@/lib/actions";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const result = await registerTenant({
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      workspaceName: form.get("workspaceName"),
      slug: form.get("slug"),
    });

    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }

    const login = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    if (login?.error) {
      setError("Your account was created. Please sign in.");
      setPending(false);
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">Professional portfolio SaaS</p>
      <h1 className="mt-4 font-display text-4xl italic text-ink">Build your professional presence.</h1>
      <p className="mt-3 text-ink-soft">Create your workspace and publish a polished portfolio with a 30-day free trial.</p>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">Your name<input name="name" required className="border border-line bg-paper-raised px-3 py-2" /></label>
        <label className="flex flex-col gap-1.5 text-sm">Email<input name="email" type="email" required className="border border-line bg-paper-raised px-3 py-2" /></label>
        <label className="flex flex-col gap-1.5 text-sm">Password<input name="password" type="password" minLength={8} required className="border border-line bg-paper-raised px-3 py-2" /></label>
        <label className="flex flex-col gap-1.5 text-sm">Workspace name<input name="workspaceName" required placeholder="Your name or studio" className="border border-line bg-paper-raised px-3 py-2" /></label>
        <label className="flex flex-col gap-1.5 text-sm">Portfolio URL<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="your-name" className="border border-line bg-paper-raised px-3 py-2 font-mono" /></label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button disabled={pending} className="mt-2 border border-ink bg-ink px-5 py-2.5 text-sm text-paper disabled:opacity-50">{pending ? "Creating workspace..." : "Start free trial"}</button>
      </form>
      <p className="mt-6 text-sm text-ink-soft">Already have an account? <Link href="/admin/login" className="text-ink underline">Sign in</Link></p>
    </main>
  );
}