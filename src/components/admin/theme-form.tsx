"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/actions";

const PRESETS = [
  { name: "Brass", value: "#B08D57" },
  { name: "Ledger green", value: "#2F5233" },
  { name: "Ink navy", value: "#2B3A55" },
  { name: "Rust", value: "#9C4A2E" },
  { name: "Slate", value: "#5B6472" },
];

export function ThemeForm({
  profile,
}: {
  profile: { accentColor: string } & Record<string, unknown>;
}) {
  const [color, setColor] = useState(profile.accentColor);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const router = useRouter();

  function save(next: string) {
    setColor(next);
    setStatus("idle");
    startTransition(async () => {
      const result = await updateProfile({ ...profile, accentColor: next });
      setStatus(result.ok ? "saved" : "error");
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl italic text-ink">Theme</h1>
      <p className="max-w-md text-sm text-ink-soft">
        Change the accent color used for links, buttons, and highlights across
        the site. Layout, typography, and animation are fixed.
      </p>

      <div className="flex flex-wrap gap-3">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => save(preset.value)}
            className="flex flex-col items-center gap-2 border border-line px-4 py-3 text-xs text-ink-soft hover:border-ink"
          >
            <span
              className="h-8 w-8 rounded-full border border-line"
              style={{ backgroundColor: preset.value }}
            />
            {preset.name}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-3 text-sm">
        Custom color
        <input
          type="color"
          value={color}
          onChange={(e) => save(e.target.value)}
          className="h-9 w-9 cursor-pointer border border-line"
        />
        <span className="font-mono text-xs text-ink-soft">{color}</span>
      </label>

      {pending ? <p className="text-sm text-ink-soft">Saving…</p> : null}
      {status === "saved" && !pending ? (
        <p className="text-sm text-ink-soft">Saved.</p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-red-700">Could not save. Try again.</p>
      ) : null}
    </div>
  );
}
