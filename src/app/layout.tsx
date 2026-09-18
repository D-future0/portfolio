import type { Metadata } from "next";
import { headers } from "next/headers";
import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { getProfile } from "@/lib/content";
import { db } from "@/lib/db";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

// Default accent for the landing page and any route without a tenant.
const DEFAULT_ACCENT = "#B08D57";

// On a /u/[slug] page, the tenant's accent color drives --accent so the
// whole site (links, buttons, focus, selection) matches their brand.
// Next sets x-pathname on every request, so we can detect the slug here
// without a client round-trip.
async function resolveAccent(): Promise<string> {
  try {
    const pathname = (await headers()).get("x-pathname") ?? "";
    const slug = pathname.split("/")[2];
    if (!slug) return DEFAULT_ACCENT;
    const tenant = await db.tenant.findUnique({ where: { slug } });
    if (!tenant) return DEFAULT_ACCENT;
    const profile = await getProfile(tenant.id);
    return profile?.accentColor ?? DEFAULT_ACCENT;
  } catch {
    return DEFAULT_ACCENT;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const accent = await resolveAccent();
  return {
    title: "Professional portfolios, beautifully presented",
    description:
      "Create and publish a professional portfolio for your work, services, and story.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const accent = await resolveAccent();

  return (
    <html
      lang="en"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <body
        className={`${newsreader.variable} ${plexSans.variable} ${plexMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}