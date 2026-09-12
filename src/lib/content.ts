import { db } from "@/lib/db";

const DEFAULT_PROFILE = {
  id: "profile",
  name: "Your Name",
  title: "Chartered Accountant",
  heroTagline: "Numbers you can trust, insight you can act on.",
  heroImageUrl: null as string | null,
  bio: "Write a short professional bio in the admin panel.",
  yearsExperience: 0,
  clientsServed: 0,
  projectsDone: 0,
  contactEmail: "you@example.com",
  phone: null as string | null,
  location: null as string | null,
  calendlyUrl: null as string | null,
  linkedinUrl: null as string | null,
  twitterUrl: null as string | null,
  resumeUrl: null as string | null,
  accentColor: "#B08D57",
  updatedAt: new Date(),
};

// The Profile table is a singleton — this helper creates the row on first
// read so the site never crashes on an empty database.
export async function getProfile() {
  try {
    const existing = await db.profile.findUnique({ where: { id: "profile" } });
    if (existing) return existing;
    return await db.profile.create({ data: { id: "profile" } });
  } catch {
    // DB not reachable yet (e.g. local build without DATABASE_URL) — fall
    // back to defaults so `next build` and first paint never hard-fail.
    return DEFAULT_PROFILE;
  }
}

export async function getExperiences() {
  try {
    return await db.experience.findMany({ orderBy: { order: "asc" } });
  } catch {
    return [];
  }
}

export async function getProjects() {
  try {
    return await db.project.findMany({ orderBy: { order: "asc" } });
  } catch {
    return [];
  }
}

export async function getCertifications() {
  try {
    return await db.certification.findMany({ orderBy: { order: "asc" } });
  } catch {
    return [];
  }
}
