"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm({ slug }: { slug: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-portfolio-slug": slug },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong. Try again.");
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <p className="text-ink-soft">
        Message sent. Thanks for reaching out — you&apos;ll hear back soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      {/* Honeypot — hidden from real visitors, bots tend to fill every field */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <label className="flex flex-col gap-1.5 text-sm">
        Name
        <input
          name="name"
          type="text"
          required
          maxLength={120}
          className="border border-line bg-paper-raised px-3 py-2 text-ink outline-none focus-visible:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        Email
        <input
          name="email"
          type="email"
          required
          className="border border-line bg-paper-raised px-3 py-2 text-ink outline-none focus-visible:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        Message
        <textarea
          name="message"
          required
          rows={4}
          maxLength={4000}
          className="border border-line bg-paper-raised px-3 py-2 text-ink outline-none focus-visible:border-accent"
        />
      </label>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-fit border border-ink bg-ink px-5 py-2.5 text-sm text-paper transition-colors hover:bg-transparent hover:text-ink disabled:opacity-50"
      >
        {status === "loading" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
