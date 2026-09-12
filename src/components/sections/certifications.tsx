import { Reveal } from "@/components/reveal";

type CertItem = {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date | null;
  credentialUrl: string | null;
};

export function Certifications({ items }: { items: CertItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="certifications" className="border-t border-line">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="font-display text-sm italic text-ink-soft sm:w-[160px]">
          Certifications
        </h2>

        <Reveal>
          <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {items.map((cert) => {
              const content = (
                <>
                  <p className="text-ink">{cert.name}</p>
                  <p className="text-sm text-ink-soft">
                    {cert.issuer}
                    {cert.issueDate
                      ? ` · ${cert.issueDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                        })}`
                      : ""}
                  </p>
                </>
              );
              return (
                <li
                  key={cert.id}
                  className="border-l border-line pl-4 py-1"
                >
                  {cert.credentialUrl ? (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block transition-colors hover:opacity-70"
                    >
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
