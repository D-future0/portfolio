"use client";

import { useState } from "react";
import { createTenant, updateTenant, deleteTenant } from "@/lib/actions";
import { TenantForm, type TenantFormValues } from "@/components/admin/tenant-form";

type Tenant = {
  id: string;
  slug: string;
  name: string;
  title: string;
  plan: string;
  published: boolean;
  approvedAt: Date | null;
  owner: { id: string; email: string; name: string | null } | null;
  profile: { name: string } | null;
};

export function TenantsManager({ tenants }: { tenants: Tenant[] }) {
  const [list, setList] = useState(tenants);
  const [creating, setCreating] = useState(false);

  async function handleCreate(values: TenantFormValues) {
    const res = await createTenant(values);
    if (res.ok) {
      setCreating(false);
      location.reload();
    } else {
      alert(res.error);
    }
  }

  async function handleTogglePublished(t: Tenant) {
    const res = await updateTenant({
      id: t.id,
      slug: t.slug,
      name: t.name,
      title: t.title,
      plan: t.plan as "FREE" | "PRO",
      published: !t.published,
      approved: !!t.approvedAt,
    });
    if (res.ok) {
      location.reload();
    } else {
      alert(res.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this tenant and all its content? The owner account is kept.")) return;
    const res = await deleteTenant(id);
    if (res.ok) {
      location.reload();
    } else {
      alert(res.error);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => setCreating(true)}
        className="w-fit border border-ink bg-ink px-4 py-2 text-sm text-paper hover:bg-transparent hover:text-ink"
      >
        Create tenant
      </button>

      {creating ? (
        <TenantForm
          mode="create"
          onClose={() => setCreating(false)}
          onSubmit={handleCreate}
        />
      ) : null}

      <ul className="divide-y divide-line border-t border-line">
        {list.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0">
              <p className="truncate text-ink">
                {t.profile?.name ?? t.name}
                <span className="ml-2 font-mono text-xs text-ink-soft">
                  /u/{t.slug}
                </span>
              </p>
              <p className="truncate text-xs text-ink-soft">
                {t.owner?.email ?? "(no owner)"} · {t.plan} ·{" "}
                {t.published && t.approvedAt ? "live" : t.published ? "pending approval" : "unpublished"}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <a
                href={`/u/${t.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-ink-soft hover:text-ink"
              >
                View
              </a>
              <button
                onClick={() => handleTogglePublished(t)}
                className="text-ink-soft hover:text-ink"
              >
                {t.published ? "Unpublish" : "Publish"}
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="text-ink-soft hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {list.length === 0 ? (
          <p className="py-6 text-sm text-ink-soft">No tenants yet. Create one to get started.</p>
        ) : null}
      </ul>
    </div>
  );
}