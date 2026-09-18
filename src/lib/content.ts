import { db } from "@/lib/db";

export type TenantSummary = {
  id: string;
  slug: string;
  name: string;
  title: string;
  published: boolean;
  approvedAt: Date | null;
  profile: ProfileSummary | null;
};

export type ProfileSummary = {
  name: string;
  title: string;
  heroTagline: string;
  heroImageUrl: string | null;
  location: string | null;
};

// The Profile row is a singleton *per tenant* — this helper creates it on
// first read so a tenant's page never hard-fails on an empty DB.
export async function getProfile(tenantId: string) {
  try {
    const existing = await db.profile.findUnique({ where: { id_tenantId: { id: "profile", tenantId } } });
    if (existing) return existing;
    return await db.profile.create({ data: { id: "profile", tenantId } });
  } catch {
    return null;
  }
}

export async function getExperiences(tenantId: string) {
  try {
    return await db.experience.findMany({
      where: { tenantId },
      orderBy: { order: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getProjects(tenantId: string) {
  try {
    return await db.project.findMany({
      where: { tenantId },
      orderBy: { order: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getCertifications(tenantId: string) {
  try {
    return await db.certification.findMany({
      where: { tenantId },
      orderBy: { order: "asc" },
    });
  } catch {
    return [];
  }
}

// Full tenant + content in one call for the public /u/[slug] page.
export async function getTenantBySlug(slug: string) {
  try {
    return await db.tenant.findUnique({
      where: { slug },
      include: {
        profile: true,
        experiences: { orderBy: { order: "asc" } },
        projects: { orderBy: { order: "asc" } },
        certifications: { orderBy: { order: "asc" } },
      },
    });
  } catch {
    return null;
  }
}

// Published + approved tenants for the landing page.
export async function getPublishedTenants() {
  try {
    return await db.tenant.findMany({
      where: { published: true, approvedAt: { not: null } },
      orderBy: { createdAt: "desc" },
      include: { profile: true },
    });
  } catch {
    return [];
  }
}

// Admin: every tenant, newest first.
export async function getAllTenants() {
  try {
    return await db.tenant.findMany({
      orderBy: { createdAt: "desc" },
      include: { profile: true, owner: true },
    });
  } catch {
    return [];
  }
}

// Owner's own tenant (scoped by owner id, never by trusting a param).
export async function getTenantByOwnerId(ownerId: string) {
  try {
    return await db.tenant.findFirst({
      where: { ownerId },
      include: {
        profile: true,
        experiences: { orderBy: { order: "asc" } },
        projects: { orderBy: { order: "asc" } },
        certifications: { orderBy: { order: "asc" } },
      },
    });
  } catch {
    return null;
  }
}