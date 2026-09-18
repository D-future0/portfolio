import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/content";

export const revalidate = 60;

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string; caseStudySlug: string }> }) {
  const { slug, caseStudySlug } = await params;
  const tenant = await getTenantBySlug(slug);
  const study = tenant?.caseStudies.find((item) => item.slug === caseStudySlug);
  if (!tenant || !tenant.published || !tenant.approvedAt || !study) notFound();
  return <main className="mx-auto max-w-3xl px-6 py-20"><a href={`/u/${slug}`} className="text-sm text-ink-soft underline">Back to portfolio</a><p className="mt-12 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">Case study</p><h1 className="mt-4 font-display text-5xl italic text-ink">{study.title}</h1><p className="mt-6 text-xl text-ink-soft">{study.summary}</p><div className="mt-12 space-y-8 text-ink-soft"><Block label="Challenge" value={study.challenge} /><Block label="Approach" value={study.approach} /><Block label="Outcome" value={study.outcome} /></div></main>;
}

function Block({ label, value }: { label: string; value: string | null }) { return value ? <section className="border-t border-line pt-4"><h2 className="font-display text-lg italic text-ink">{label}</h2><p className="mt-2 whitespace-pre-wrap">{value}</p></section> : null; }