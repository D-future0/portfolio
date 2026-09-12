"use client";

import { useState, useTransition } from "react";
import { upsertExperience, deleteExperience } from "@/lib/actions";

type Experience = {
  id: string;
  company: string;
  role: string;
  startDate: string; // yyyy-mm-dd
  endDate: string | null;
  current: boolean;
  location: string | null;
  bullets: string[];
  order: number;
};

const EMPTY: Experience = {
  id: "",
  company: "",
  role: "",
  startDate: "",
  endDate: null,
  current: false,
  location: "",
  bullets: [],
  order: 0,
};

export function ExperienceManager({ items }: { items: Experience[] }) {
  const [list, setList] = useState(items);
  const [editing, setEditing] = useState<Experience | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl italic text-ink">Experience</h1>
        <button
          onClick={() => setEditing({ ...EMPTY, order: list.length })}
          className="border border-ink px-4 py-2 text-sm text-ink hover:bg-ink hover:text-paper"
        >
          Add role
        </button>
      </div>

      <ul className="divide-y divide-line border-t border-line">
        {list.map((item) => (
          <li key={item.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-ink">
                {item.role} · {item.company}
              </p>
              <p className="text-xs text-ink-soft">
                {item.startDate} — {item.current ? "Present" : item.endDate}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => setEditing(item)} className="text-ink-soft hover:text-ink">
                Edit
              </button>
              <DeleteButton
                id={item.id}
                onDeleted={() => setList((l) => l.filter((x) => x.id !== item.id))}
              />
            </div>
          </li>
        ))}
        {list.length === 0 ? (
          <p className="py-6 text-sm text-ink-soft">No experience entries yet.</p>
        ) : null}
      </ul>

      {editing ? (
        <ExperienceFormModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setList((l) => {
              const exists = l.some((x) => x.id === saved.id);
              return exists
                ? l.map((x) => (x.id === saved.id ? saved : x))
                : [...l, saved];
            });
            setEditing(null);
          }}
        />
      ) : null}
    </div>
  );
}

function DeleteButton({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this role?")) return;
        startTransition(async () => {
          const res = await deleteExperience(id);
          if (res.ok) onDeleted();
        });
      }}
      className="text-ink-soft hover:text-red-700 disabled:opacity-50"
    >
      Delete
    </button>
  );
}

function ExperienceFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Experience;
  onClose: () => void;
  onSaved: (item: Experience) => void;
}) {
  const [form, setForm] = useState(initial);
  const [bulletsText, setBulletsText] = useState(initial.bullets.join("\n"));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const bullets = bulletsText.split("\n").map((b) => b.trim()).filter(Boolean);

    startTransition(async () => {
      const result = await upsertExperience({
        ...form,
        id: form.id || undefined,
        bullets,
        endDate: form.current ? null : form.endDate,
      });
      if (result.ok) {
        onSaved({ ...form, bullets, id: form.id || crypto.randomUUID() });
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
          {form.id ? "Edit role" : "Add role"}
        </h2>

        <TextInput label="Company" value={form.company} onChange={(v) => setForm((f) => ({ ...f, company: v }))} />
        <TextInput label="Role" value={form.role} onChange={(v) => setForm((f) => ({ ...f, role: v }))} />
        <TextInput
          label="Location"
          value={form.location ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, location: v }))}
        />

        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="Start date"
            type="date"
            value={form.startDate}
            onChange={(v) => setForm((f) => ({ ...f, startDate: v }))}
          />
          <TextInput
            label="End date"
            type="date"
            value={form.endDate ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, endDate: v }))}
            disabled={form.current}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.current}
            onChange={(e) => setForm((f) => ({ ...f, current: e.target.checked }))}
          />
          Current role
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          Achievements (one per line)
          <textarea
            value={bulletsText}
            onChange={(e) => setBulletsText(e.target.value)}
            rows={5}
            className="border border-line bg-paper-raised px-3 py-2 outline-none focus-visible:border-accent"
          />
        </label>

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
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label}
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="border border-line bg-paper-raised px-3 py-2 outline-none focus-visible:border-accent disabled:opacity-50"
      />
    </label>
  );
}
