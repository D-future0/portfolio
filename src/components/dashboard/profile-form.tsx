"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions";
import { ImageUploadField } from "@/components/admin/image-upload-field";

export type ProfileFormProps = {
  tenantId: string;
  slug: string;
  profile: {
    name: string;
    title: string;
    heroTagline: string;
    heroImageUrl: string | null;
    bio: string;
    yearsExperience: number;
    clientsServed: number;
    projectsDone: number;
    contactEmail: string;
    phone: string | null;
    location: string | null;
    calendlyUrl: string | null;
    linkedinUrl: string | null;
    twitterUrl: string | null;
    resumeUrl: string | null;
    accentColor: string;
  };
};

export function ProfileForm({ tenantId, slug, profile }: ProfileFormProps) {
  const [form, setForm] = useState(profile);
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ProfileFormProps["profile"]>(key: K, value: ProfileFormProps["profile"][K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    startTransition(async () => {
      const result = await updateProfile({ tenantId, ...form });
      if (result.ok) {
        setStatus("saved");
      } else {
        setStatus("error");
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <Section title="Hero">
        <Field label="Name" value={form.name} onChange={(v) => set("name", v)} />
        <Field label="Title" value={form.title} onChange={(v) => set("title", v)} />
        <Field
          label="Tagline"
          value={form.heroTagline}
          onChange={(v) => set("heroTagline", v)}
        />
        <ImageUploadField
          label="Hero photo"
          value={form.heroImageUrl}
          onChange={(url) => set("heroImageUrl", url)}
        />
        <Field
          label="Location"
          value={form.location ?? ""}
          onChange={(v) => set("location", v)}
        />
      </Section>

      <Section title="About">
        <TextArea label="Bio" value={form.bio} onChange={(v) => set("bio", v)} rows={6} />
      </Section>

      <Section title="Ledger stats (hero tally)">
        <div className="grid grid-cols-3 gap-4">
          <NumberField
            label="Years experience"
            value={form.yearsExperience}
            onChange={(v) => set("yearsExperience", v)}
          />
          <NumberField
            label="Clients served"
            value={form.clientsServed}
            onChange={(v) => set("clientsServed", v)}
          />
          <NumberField
            label="Projects done"
            value={form.projectsDone}
            onChange={(v) => set("projectsDone", v)}
          />
        </div>
      </Section>

      <Section title="Contact">
        <Field
          label="Contact email"
          type="email"
          value={form.contactEmail}
          onChange={(v) => set("contactEmail", v)}
        />
        <Field label="Phone" value={form.phone ?? ""} onChange={(v) => set("phone", v)} />
        <Field
          label="Calendly URL"
          value={form.calendlyUrl ?? ""}
          onChange={(v) => set("calendlyUrl", v)}
          placeholder="https://calendly.com/you/intro"
        />
        <Field
          label="LinkedIn URL"
          value={form.linkedinUrl ?? ""}
          onChange={(v) => set("linkedinUrl", v)}
        />
        <Field
          label="Twitter/X URL"
          value={form.twitterUrl ?? ""}
          onChange={(v) => set("twitterUrl", v)}
        />
        <Field
          label="Resume/CV URL"
          value={form.resumeUrl ?? ""}
          onChange={(v) => set("resumeUrl", v)}
        />
      </Section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="w-fit border border-ink bg-ink px-5 py-2.5 text-sm text-paper transition-colors hover:bg-transparent hover:text-ink disabled:opacity-50"
        >
          Save changes
        </button>
        {status === "saved" ? (
          <span className="text-sm text-ink-soft">Saved.</span>
        ) : null}
        {status === "error" ? (
          <span className="text-sm text-red-700">{error}</span>
        ) : null}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 border-t border-line pt-6">
      <legend className="mb-1 font-display text-sm italic text-ink-soft">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="border border-line bg-paper-raised px-3 py-2 outline-none focus-visible:border-accent"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label}
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border border-line bg-paper-raised px-3 py-2 font-mono outline-none focus-visible:border-accent"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label}
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="border border-line bg-paper-raised px-3 py-2 outline-none focus-visible:border-accent"
      />
    </label>
  );
}