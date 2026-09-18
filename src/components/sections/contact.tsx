import { Reveal } from "@/components/reveal";
import { ContactForm } from "@/components/contact-form";
import { CalendlyEmbed } from "@/components/calendly-embed";

export function Contact({
  slug,
  resumeUrl,
  calendlyUrl,
  linkedinUrl,
  twitterUrl,
}: {
  slug: string;
  resumeUrl?: string | null;
  calendlyUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
}) {
  return (
    <section id="contact" className="border-t border-line">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="font-display text-sm italic text-ink-soft sm:w-[160px]">
          Contact
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-12 sm:grid-cols-2">
          <Reveal>
            <div>
              <p className="mb-6 max-w-sm text-ink-soft">
                Have a question or want to work together? Send a message, or
                book time directly on the calendar.
              </p>
              <ContactForm slug={slug} />
              {resumeUrl ? <a href={resumeUrl} download className="mt-5 inline-block text-sm text-ink underline underline-offset-4">Download CV / resume</a> : null}
              {(linkedinUrl || twitterUrl) && (
                <div className="mt-8 flex gap-4 text-sm text-ink-soft">
                  {linkedinUrl ? (
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-ink"
                    >
                      LinkedIn
                    </a>
                  ) : null}
                  {twitterUrl ? (
                    <a
                      href={twitterUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-ink"
                    >
                      Twitter
                    </a>
                  ) : null}
                </div>
              )}
            </div>
          </Reveal>

          {calendlyUrl ? (
            <Reveal delay={0.1}>
              <CalendlyEmbed url={calendlyUrl} />
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
