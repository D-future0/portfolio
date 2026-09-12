"use client";

import { useState, useTransition } from "react";
import { upsertProject, deleteProject } from "@/lib/actions";
import { ImageUploadField } from "@/components/admin/image-upload-field";

type Project = {
  id: string;
  title: string;
  summary: string;
  description: string | null;
  client: string | null;
  imageUrl: string | null;
  tags: string[];
  order: number;
};

const EMPTY: Project = {
  id: "",
  title: "",
  summary: "",
  description: "",
  client: "",
  imageUrl: null,
  tags: [],
  order: 0,
};

export function ProjectsManager({ items }: { items: Project[] }) {
  const [list, setList] = useState(items);
  const [editing, setEditing] = useState<Project | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl italic text-ink">Projects</h1>
        <button
          onClick={() => setEditing({ ...EMPTY, order: list.length })}
          className="border border-ink px-4 py-2 text-sm text-ink hover:bg-ink hover:text-paper"
        >
          Add project
        </button>
      </div>

      <ul className="divide-y divide-line border-t border-line">
        {list.map((item) => (
          <li key={item.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-ink">{item.title}</p>
              <p className="text-xs text-ink-soft">{item.summary}</p>
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
          <p className="py-6 text-sm text-ink-soft">No projects yet.</p>
        ) : null}
      </ul>

      {editing ? (
        <ProjectFormModal
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

function DeleteButton({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this project?")) return;
        startTransition(async () => {
          const res = await deleteProject(id);
          if (res.ok) onDeleted();
        });
      }}
      className="text-ink-soft hover:text-red-700 disabled:opacity-50"
    >
      Delete
    </button>
  );
}

function ProjectFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Project;
  onClose: () => void;
  onSaved: (item: Project) => void;
}) {
  const [form, setForm] = useState(initial);
  const [tagsText, setTagsText] = useState(initial.tags.join(", "));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const tags = tagsText.split(",").map((t) => t.trim()).filter(Boolean);

    startTransition(async () => {
      const result = await upsertProject({
        ...form,
        id: form.id || undefined,
        tags,
      });
      if (result.ok) {
        onSaved({ ...form, tags, id: form.id || crypto.randomUUID() });
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
          {form.id ? "Edit project" : "Add project"}
        </h2>

        <TextInput label="Title" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} />
        <TextInput
          label="Summary (one line)"
          value={form.summary}
          onChange={(v) => setForm((f) => ({ ...f, summary: v }))}
        />
        <label className="flex flex-col gap-1.5 text-sm">
          Description
          <textarea
            value={form.description ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={4}
            className="border border-line bg-paper-raised px-3 py-2 outline-none focus-visible:border-accent"
          />
        </label>
        <TextInput
          label="Client (optional)"
          value={form.client ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, client: v }))}
        />
        <ImageUploadField
          label="Thumbnail"
          value={form.imageUrl}
          onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
        />
        <TextInput
          label="Tags (comma separated)"
          value={tagsText}
          onChange={setTagsText}
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-line bg-paper-raised px-3 py-2 outline-none focus-visible:border-accent"
      />
    </label>
  );
}
