"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";

export function ImageUploadField({
  label,
  value,
  onChange,
  accept = "image/png,image/jpeg,image/webp,image/avif",
  fileLabel = "image",
}: {
  label: string;
  value: string | null | undefined;
  onChange: (url: string) => void;
  accept?: string;
  fileLabel?: "image" | "PDF";
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Upload failed.");
      onChange(body.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <span>{label}</span>
      <div className="flex items-center gap-4">
        {value && fileLabel === "image" ? (
          <div className="relative h-16 w-16 overflow-hidden rounded-full border border-line">
            <Image src={value} alt="" fill sizes="64px" className="object-cover" />
          </div>
        ) : null}
        <label className="cursor-pointer border border-line px-3 py-2 text-xs text-ink-soft hover:border-ink">
          {uploading ? "Uploading…" : value ? `Replace ${fileLabel}` : `Upload ${fileLabel}`}
          <input
            type="file"
            accept={accept}
            onChange={handleFile}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
