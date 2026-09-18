"use client";

import { useState } from "react";

export type TenantFormValues = {
  ownerEmail: string;
  ownerName?: string;
  ownerPassword: string;
  slug: string;
  name: string;
  title: string;
  plan: "FREE" | "PRO";
  published: boolean;
  approved: boolean;
};

export function TenantForm({
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  mode: "create";
  initial?: Partial<TenantFormValues>;
  onClose: () => void;
  onSubmit: (values: TenantFormValues) => Promise<void>;
}) {
  const [form, setForm] = useState<TenantFormValues>({
    ownerEmail: "",
    ownerName: "",
    ownerPassword: "",
    slug: "",
    name: "",
    title: "Independent Professional",
    plan: "FREE",
    published: true,
    approved: true,
    ...initial,
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof TenantFormValues>(key: K, value: TenantFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-line bg-paper-raised p-6">
      <h2 className="font-display text-lg italic text-ink">Create tenant</h2>

      <label className="flex flex-col gap-1.5 text-sm">
        Owner email
        <input
          type="email"
          required
          value={form.ownerEmail}
          onChange={(e) => set("ownerEmail", e.target.value)}
          className="border border-line bg-paper px-3 py-2 outline-none focus-visible:border-accent"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Owner name (optional)
        <input
          value={form.ownerName ?? ""}
          onChange={(e) => set("ownerName", e.target.value)}
          className="border border-line bg-paper px-3 py-2 outline-none focus-visible:border-accent"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Owner password (min 8 chars)
        <input
          type="password"
          required
          minLength={8}
          value={form.ownerPassword}
          onChange={(e) => set("ownerPassword", e.target.value)}
          className="border border-line bg-paper px-3 py-2 outline-none focus-visible:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        Slug — public URL is /u/[slug]
        <input
          required
          value={form.slug}
          onChange={(e) => set("slug", e.target.value.toLowerCase())}
          placeholder="e.g. acme-accounting"
          className="border border-line bg-paper px-3 py-2 font-mono outline-none focus-visible:border-accent"
        />
        <span className="text-xs text-ink-soft">
          Lowercase letters, numbers, hyphens. 3-32 chars. Reserved: admin.
        </span>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        Workspace name
        <input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="border border-line bg-paper px-3 py-2 outline-none focus-visible:border-accent"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Title
        <input
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className="border border-line bg-paper px-3 py-2 outline-none focus-visible:border-accent"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => set("published", e.target.checked)}
        />
        Published (visible to visitors)
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.approved}
          onChange={(e) => set("approved", e.target.checked)}
        />
        Approved (admin has made it live)
      </label>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="border border-ink bg-ink px-4 py-2 text-sm text-paper hover:bg-transparent hover:text-ink disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create tenant"}
        </button>
        <button type="button" onClick={onClose} className="text-sm text-ink-soft hover:text-ink">
          Cancel
        </button>
      </div>
    </form>
  );
}