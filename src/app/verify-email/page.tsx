import Link from "next/link";

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6"><h1 className="font-display text-3xl italic text-ink">Check your inbox</h1><p className="mt-3 text-ink-soft">Use the verification link in your email to activate your workspace.</p>{token ? <a href={`/api/auth/verify-email?token=${encodeURIComponent(token)}`} className="mt-6 w-fit border border-ink bg-ink px-5 py-2.5 text-sm text-paper">Verify email</a> : null}<Link href="/admin/login" className="mt-6 text-sm text-ink underline">Return to sign in</Link></main>;
}