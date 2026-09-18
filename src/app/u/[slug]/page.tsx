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
    title: `${p?.name ?? tenant.name} — ${p?.title ?? tenant.title}`,
    description: p?.heroTagline ?? "",
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
    <>
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
        <Contact
          slug={slug}
          calendlyUrl={p?.calendlyUrl ?? null}
          linkedinUrl={p?.linkedinUrl ?? null}
          twitterUrl={p?.twitterUrl ?? null}
        />
      </main>
      <Footer name={p?.name ?? tenant.name} />
    </>
  );
}