"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const LINKS = [
  { href: "/dashboard", label: "Profile" },
  { href: "/dashboard/experience", label: "Experience" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/certifications", label: "Certifications" },
  { href: "/dashboard/theme", label: "Theme" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/inbox", label: "Inbox" },
  { href: "/dashboard/analytics", label: "Analytics" },
];

export function DashboardNav({
  tenant,
}: {
  tenant: { slug: string; plan: string; published: boolean; trialEndsAt: Date | null };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <nav className="hidden flex-wrap gap-5 text-sm md:flex" aria-label="Dashboard navigation">
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
        <div className="hidden items-center gap-4 text-sm md:flex">
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
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-dashboard-navigation"
          aria-label={open ? "Close dashboard navigation" : "Open dashboard navigation"}
          onClick={() => setOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center border border-line text-ink md:hidden"
        >
          <span aria-hidden="true" className="text-xl leading-none">{open ? "x" : "="}</span>
        </button>
      </div>
      {open ? (
        <div id="mobile-dashboard-navigation" className="border-t border-line px-4 py-3 md:hidden">
          <nav className="flex flex-col" aria-label="Mobile dashboard navigation">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={pathname === link.href ? "border-b border-line py-3 text-ink underline decoration-accent decoration-2 underline-offset-4 last:border-b-0" : "border-b border-line py-3 text-ink-soft last:border-b-0"}>{link.label}</Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3 text-sm">
            <a href={`/u/${tenant.slug}`} target="_blank" rel="noreferrer" className="text-ink-soft">View site</a>
            <span className="font-mono text-xs text-ink-soft">{tenant.plan}{tenant.trialEndsAt ? ` · trial until ${tenant.trialEndsAt.toLocaleDateString()}` : ""}</span>
            <button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="w-fit text-ink-soft">Sign out</button>
          </div>
        </div>
      ) : null}
    </header>
  );
}