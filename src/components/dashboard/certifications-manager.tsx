"use client";

import { useState, useTransition } from "react";
import { upsertCertification, deleteCertification } from "@/lib/actions";

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  issueDate: string | null;
  credentialUrl: string | null;
  order: number;
};

const EMPTY: Certification = {
  id: "",
  name: "",
  issuer: "",
  issueDate: null,
  credentialUrl: "",
  order: 0,
};

export function CertificationsManager({
  tenantId,
  items,
}: {
  tenantId: string;
  items: Certification[];
}) {
  const [list, setList] = useState(items);
  const [editing, setEditing] = useState<Certification | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl italic text-ink">Certifications</h1>
        <button
          onClick={() => setEditing({ ...EMPTY, order: list.length })}
          className="border border-ink px-4 py-2 text-sm text-ink hover:bg-ink hover:text-paper"
        >
          Add certification
        </button>
      </div>

      <ul className="divide-y divide-line border-t border-line">
        {list.map((item) => (
          <li key={item.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-ink">{item.name}</p>
              <p className="text-xs text-ink-soft">{item.issuer}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => setEditing(item)} className="text-ink-soft hover:text-ink">
                Edit
              </button>
              <DeleteButton
                tenantId={tenantId}
                id={item.id}
                onDeleted={() => setList((l) => l.filter((x) => x.id !== item.id))}
              />
            </div>
          </li>
        ))}
        {list.length === 0 ? (
          <p className="py-6 text-sm text-ink-soft">No certifications yet.</p>
        ) : null}
      </ul>

      {editing ? (
        <CertFormModal
          tenantId={tenantId}
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setList((l) => {
              const exists = l.some((x) => x.id === saved.id);
              return exists ? l.map((x) => (x.id === saved.id ? saved : x)) : [...l, saved];
            });
            setEditing(null);
          }}
        />
      ) : null}
    </div>
  );
}

function DeleteButton({
  tenantId,
  id,
  onDeleted,
}: {
  tenantId: string;
  id: string;
  onDeleted: () => void;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this certification?")) return;
        startTransition(async () => {
          const res = await deleteCertification(id, tenantId);
          if (res.ok) onDeleted();
        });
      }}
      className="text-ink-soft hover:text-red-700 disabled:opacity-50"
    >
      Delete
    </button>
  );
}

function CertFormModal({
  tenantId,
  initial,
  onClose,
  onSaved,
}: {
  tenantId: string;
  initial: Certification;
  onClose: () => void;
  onSaved: (item: Certification) => void;
}) {
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await upsertCertification({
        ...form,
        tenantId,
        id: form.id || undefined,
      });
      if (result.ok) {
        onSaved({ ...form, id: form.id || crypto.randomUUID() });
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-lg flex-col gap-4 overflow-y-auto border border-line bg-paper p-6"
      >
        <h2 className="font-display text-lg italic text-ink">
          {form.id ? "Edit certification" : "Add certification"}
        </h2>

        <TextInput label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
        <TextInput label="Issuer" value={form.issuer} onChange={(v) => setForm((f) => ({ ...f, issuer: v }))} />
        <TextInput
          label="Issue date"
          type="date"
          value={form.issueDate ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, issueDate: v }))}
        />
        <TextInput
          label="Credential URL (optional)"
          value={form.credentialUrl ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, credentialUrl: v }))}
        />

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="border border-ink bg-ink px-4 py-2 text-sm text-paper hover:bg-transparent hover:text-ink disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={onClose} className="text-sm text-ink-soft hover:text-ink">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-line bg-paper-raised px-3 py-2 outline-none focus-visible:border-accent"
      />
    </label>
  );
}
