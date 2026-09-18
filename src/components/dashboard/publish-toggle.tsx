"use client";

import { useState, useTransition } from "react";
import { setPublished } from "@/lib/actions";

export function PublishToggle({
  tenantId,
  slug,
  published,
}: {
  tenantId: string;
  slug: string;
  published: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-4 rounded border border-line bg-paper-raised p-4">
      <div>
        <p className="text-sm text-ink">
          {published ? "Portfolio is live" : "Portfolio is hidden"}
        </p>
        <p className="text-xs text-ink-soft">
          {published
            ? `Visitors can reach /u/${slug}.`
            : "Visitors get a 404; only you can see it in the dashboard."}
        </p>
      </div>
      <button
        disabled={pending}
        onClick={() => startTransition(async () => {
          await setPublished({ tenantId, published: !published });
        })}
        className="w-fit border border-ink px-4 py-2 text-sm text-ink hover:bg-ink hover:text-paper disabled:opacity-50"
      >
        {pending ? "Saving…" : published ? "Unpublish" : "Publish"}
      </button>
    </div>
  );
}