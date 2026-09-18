"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const LINKS = [
  { href: "/dashboard", label: "Profile" },
  { href: "/dashboard/experience", label: "Experience" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/certifications", label: "Certifications" },
  { href: "/dashboard/theme", label: "Theme" },
  { href: "/dashboard/billing", label: "Billing" },
];

export function DashboardNav({
  tenant,
}: {
  tenant: { slug: string; plan: string; published: boolean; trialEndsAt: Date | null };
}) {
  const pathname = usePathname();

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <nav className="flex flex-wrap gap-5 text-sm">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "text-ink underline decoration-accent decoration-2 underline-offset-4"
                  : "text-ink-soft hover:text-ink"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4 text-sm">
          <a
            href={`/u/${tenant.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-ink-soft hover:text-ink"
          >
            View site
          </a>
          <span className="font-mono text-xs text-ink-soft">
            {tenant.plan}
            {tenant.trialEndsAt
              ? ` · trial until ${tenant.trialEndsAt.toLocaleDateString()}`
              : ""}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="text-ink-soft hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}