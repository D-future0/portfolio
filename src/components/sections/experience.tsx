import { Reveal } from "@/components/reveal";

type ExperienceItem = {
  id: string;
  company: string;
  role: string;
  startDate: Date;
  endDate: Date | null;
  current: boolean;
  location: string | null;
  bullets: string[];
};

function formatRange(start: Date, end: Date | null, current: boolean) {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  return `${fmt(start)} — ${current ? "Present" : end ? fmt(end) : ""}`;
}

export function Experience({ items }: { items: ExperienceItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="experience" className="border-t border-line">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="font-display text-sm italic text-ink-soft sm:w-[160px]">
          Experience
        </h2>

        <div className="mt-8 divide-y divide-line border-t border-line">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={Math.min(i * 0.05, 0.2)}>
              <div className="grid grid-cols-1 gap-2 py-6 sm:grid-cols-[160px_1fr] sm:gap-8">
                <p className="font-mono text-xs tabular text-ink-soft">
                  {formatRange(item.startDate, item.endDate, item.current)}
                </p>
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="text-lg text-ink">
                      {item.role} · {item.company}
                    </h3>
                    {item.location ? (
                      <span className="text-sm text-ink-soft">
                        {item.location}
                      </span>
                    ) : null}
                  </div>
                  {item.bullets.length > 0 ? (
                    <ul className="mt-3 space-y-1.5 text-ink-soft">
                      {item.bullets.map((b, idx) => (
                        <li key={idx} className="pl-4 -indent-4">
                          – {b}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
