"use client";

import { useState, type FormEvent, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const res = await Promise.race([
      signIn("credentials", {
        email: form.get("email"),
        password: form.get("password"),
        redirect: false,
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 15_000)),
    ]);

    setLoading(false);
    if (!res) {
      setError("The server took too long to respond. Check the database connection and try again.");
      return;
    }
    if (res?.error) {
      setError("Incorrect email or password.");
      return;
    }
    router.push(params.get("callbackUrl") ?? "/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-display text-2xl italic text-ink">Sign in to your workspace</h1>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            className="border border-line bg-paper-raised px-3 py-2 outline-none focus-visible:border-accent"
          />
        </label>
        <Link href="/forgot-password" className="text-sm text-ink-soft underline">Forgot password?</Link>
        <label className="flex flex-col gap-1.5 text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            className="border border-line bg-paper-raised px-3 py-2 outline-none focus-visible:border-accent"
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-fit border border-ink bg-ink px-5 py-2.5 text-sm text-paper transition-colors hover:bg-transparent hover:text-ink disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-soft">
        New here? <Link href="/signup" className="text-ink underline">Start a 30-day free trial</Link>
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
