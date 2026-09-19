"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const LINKS = [
  { href: "/admin/tenants", label: "Tenants" },
];

export function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <nav className="hidden gap-5 text-sm sm:flex" aria-label="Admin navigation">
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
        <div className="hidden items-center gap-4 text-sm sm:flex">
          <Link href="/" className="text-ink-soft hover:text-ink">
            View site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="text-ink-soft hover:text-ink"
          >
            Sign out
          </button>
        </div>
        <button type="button" aria-expanded={open} aria-controls="mobile-admin-navigation" aria-label={open ? "Close admin navigation" : "Open admin navigation"} onClick={() => setOpen((value) => !value)} className="flex h-11 w-11 items-center justify-center border border-line text-ink sm:hidden">
          <span aria-hidden="true" className="text-xl leading-none">{open ? "x" : "="}</span>
        </button>
      </div>
      {open ? <div id="mobile-admin-navigation" className="border-t border-line px-4 py-3 sm:hidden"><nav className="flex flex-col" aria-label="Mobile admin navigation">{LINKS.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="border-b border-line py-3 text-sm text-ink-soft last:border-b-0">{link.label}</Link>)}</nav><div className="mt-3 flex flex-col gap-3 border-t border-line pt-3 text-sm"><Link href="/" className="text-ink-soft">View site</Link><button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="w-fit text-ink-soft">Sign out</button></div></div> : null}
    </header>
  );
}