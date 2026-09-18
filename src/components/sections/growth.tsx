type GrowthData = {
  services: { id: string; name: string; description: string; priceLabel: string | null }[];
  testimonials: { id: string; name: string; role: string | null; company: string | null; quote: string }[];
  slug: string;
  caseStudies: { id: string; slug: string; title: string; summary: string; outcome: string | null }[];
};

export function GrowthSections({ slug, services, testimonials, caseStudies }: GrowthData) {
  if (!services.length && !testimonials.length && !caseStudies.length) return null;
  return (
    <>
      {services.length ? <section className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-16"><h2 className="font-display text-sm italic text-ink-soft">Services</h2><div className="mt-8 grid gap-6 sm:grid-cols-3">{services.map((service) => <article key={service.id} className="border-t border-line pt-4"><h3 className="text-lg text-ink">{service.name}</h3><p className="mt-2 text-sm text-ink-soft">{service.description}</p>{service.priceLabel ? <p className="mt-4 font-mono text-xs text-ink-soft">{service.priceLabel}</p> : null}</article>)}</div></div></section> : null}
      {caseStudies.length ? <section className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-16"><h2 className="font-display text-sm italic text-ink-soft">Case studies</h2><div className="mt-8 divide-y divide-line border-t border-line">{caseStudies.map((study) => <article key={study.id} className="py-6"><a href={`/u/${slug}/case-studies/${study.slug}`}><h3 className="text-lg text-ink">{study.title}</h3><p className="mt-2 max-w-2xl text-ink-soft">{study.summary}</p>{study.outcome ? <p className="mt-3 text-sm text-ink">{study.outcome}</p> : null}</a></article>)}</div></div></section> : null}
      {testimonials.length ? <section className="border-t border-line"><div className="mx-auto max-w-5xl px-6 py-16"><h2 className="font-display text-sm italic text-ink-soft">Kind words</h2><div className="mt-8 grid gap-6 sm:grid-cols-2">{testimonials.map((testimonial) => <blockquote key={testimonial.id} className="border-t border-line pt-4"><p className="font-display text-xl italic text-ink">&ldquo;{testimonial.quote}&rdquo;</p><footer className="mt-4 text-sm text-ink-soft">{testimonial.name}{testimonial.role ? `, ${testimonial.role}` : ""}{testimonial.company ? ` at ${testimonial.company}` : ""}</footer></blockquote>)}</div></div></section> : null}
    </>
  );
}