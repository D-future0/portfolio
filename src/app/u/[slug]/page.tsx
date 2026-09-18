import { notFound } from "next/navigation";
import { Nav } from "@/components/sections/nav";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Experience } from "@/components/sections/experience";
import { Projects } from "@/components/sections/projects";
import { Certifications } from "@/components/sections/certifications";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";
import { getTenantBySlug } from "@/lib/content";
import { AnalyticsView } from "@/components/analytics-view";
import { GrowthSections } from "@/components/sections/growth";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) return { title: "Portfolio not found" };
  const p = tenant.profile;
  return {
    title: tenant.seoTitle ?? `${p?.name ?? tenant.name} — ${p?.title ?? tenant.title}`,
    description: tenant.seoDescription ?? p?.heroTagline ?? "",
    openGraph: {
      title: tenant.seoTitle ?? `${p?.name ?? tenant.name} — ${p?.title ?? tenant.title}`,
      description: tenant.seoDescription ?? p?.heroTagline ?? "",
      images: [tenant.socialImageUrl ?? `/u/${slug}/opengraph-image`],
    },
  };
}

export default async function TenantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);

  // Only published + approved tenants render. Unpublished ones 404 for
  // visitors but remain editable by their owner in /dashboard.
  if (!tenant || !tenant.published || !tenant.approvedAt) {
    notFound();
  }

  const p = tenant.profile;

  return (
    <div className="portfolio-shell" data-template={tenant.template}>
      <AnalyticsView tenantId={tenant.id} path={`/u/${slug}`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": tenant.profession === "agency" ? "Organization" : "ProfessionalService",
        name: p?.name ?? tenant.name,
        description: tenant.seoDescription ?? p?.heroTagline ?? "",
        url: `${process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/u/${slug}`,
        email: p?.contactEmail,
        image: p?.heroImageUrl,
      }).replace(/</g, "\\u003c") }} />
      <Nav name={p?.name ?? tenant.name} />
      <main>
        <Hero
          name={p?.name ?? tenant.name}
          title={p?.title ?? tenant.title}
          location={p?.location ?? null}
          tagline={p?.heroTagline ?? ""}
          heroImageUrl={p?.heroImageUrl ?? null}
          yearsExperience={p?.yearsExperience ?? 0}
          clientsServed={p?.clientsServed ?? 0}
          projectsDone={p?.projectsDone ?? 0}
          contactEmail={p?.contactEmail ?? ""}
          calendlyUrl={p?.calendlyUrl ?? null}
        />
        <About bio={p?.bio ?? ""} />
        <Experience items={tenant.experiences} />
        <Projects items={tenant.projects} />
        <Certifications items={tenant.certifications} />
        <GrowthSections slug={slug} services={tenant.services} testimonials={tenant.testimonials} caseStudies={tenant.caseStudies} />
        <Contact
          slug={slug}
          resumeUrl={p?.resumeUrl ?? null}
          calendlyUrl={p?.calendlyUrl ?? null}
          linkedinUrl={p?.linkedinUrl ?? null}
          twitterUrl={p?.twitterUrl ?? null}
        />
      </main>
      <Footer name={p?.name ?? tenant.name} />
    </div>
  );
}