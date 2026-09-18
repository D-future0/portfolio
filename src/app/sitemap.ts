import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  let tenants: { slug: string; updatedAt: Date; caseStudies: { slug: string; updatedAt: Date }[] }[] = [];
  try {
    tenants = await db.tenant.findMany({ where: { published: true, approvedAt: { not: null } }, select: { slug: true, updatedAt: true, caseStudies: { where: { published: true }, select: { slug: true, updatedAt: true } } } });
  } catch (error) {
    logger.warn("Sitemap tenant lookup failed; returning base URL", { error: error instanceof Error ? error.message : String(error) });
  }
  return [
    { url: baseUrl, lastModified: new Date() },
    ...tenants.flatMap((tenant) => [{ url: `${baseUrl}/u/${tenant.slug}`, lastModified: tenant.updatedAt }, ...tenant.caseStudies.map((study) => ({ url: `${baseUrl}/u/${tenant.slug}/case-studies/${study.slug}`, lastModified: study.updatedAt }))]),
  ];
}