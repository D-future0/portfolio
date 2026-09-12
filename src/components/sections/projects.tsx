import Image from "next/image";
import { Reveal } from "@/components/reveal";

type ProjectItem = {
  id: string;
  title: string;
  summary: string;
  description: string | null;
  client: string | null;
  imageUrl: string | null;
  tags: string[];
};

export function Projects({ items }: { items: ProjectItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="projects" className="border-t border-line">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="font-display text-sm italic text-ink-soft sm:w-[160px]">
          Projects
        </h2>

        <div className="mt-8 divide-y divide-line border-t border-line">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={Math.min(i * 0.05, 0.2)}>
              <div className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-[160px_1fr] sm:gap-8">
                {item.imageUrl ? (
                  <div className="relative h-24 w-full overflow-hidden border border-line sm:h-24 sm:w-[160px]">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <p className="font-mono text-xs text-ink-soft">
                    {item.client ?? ""}
                  </p>
                )}
                <div>
                  <h3 className="text-lg text-ink">{item.title}</h3>
                  <p className="mt-1 max-w-2xl text-ink-soft">
                    {item.summary}
                  </p>
                  {item.tags.length > 0 ? (
                    <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-ink-soft">
                      {item.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
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
