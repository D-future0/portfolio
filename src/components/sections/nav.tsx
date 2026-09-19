"use client";

import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

export function Nav({ name }: { name: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="#top" className="font-display text-lg italic text-ink">
          {name}
        </Link>
        <nav className="hidden gap-8 text-sm text-ink-soft sm:flex" aria-label="Main navigation">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-public-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center border border-line text-ink sm:hidden"
        >
          <span aria-hidden="true" className="text-xl leading-none">{open ? "x" : "="}</span>
        </button>
      </div>
      {open ? (
        <nav id="mobile-public-navigation" aria-label="Mobile navigation" className="border-t border-line px-4 py-3 sm:hidden">
          <div className="flex flex-col">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="border-b border-line py-3 text-sm text-ink-soft last:border-b-0">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
