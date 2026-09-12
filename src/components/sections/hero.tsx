import Image from "next/image";
import { CountUp } from "@/components/count-up";

export function Hero({
  name,
  title,
  location,
  tagline,
  heroImageUrl,
  yearsExperience,
  clientsServed,
  projectsDone,
  contactEmail,
  calendlyUrl,
}: {
  name: string;
  title: string;
  location?: string | null;
  tagline: string;
  heroImageUrl?: string | null;
  yearsExperience: number;
  clientsServed: number;
  projectsDone: number;
  contactEmail: string;
  calendlyUrl?: string | null;
}) {
  return (
    <section id="top" className="mx-auto max-w-5xl px-6 pb-16 pt-14 sm:pt-20">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-[minmax(0,160px)_1fr] sm:gap-8">
        <div className="flex flex-col gap-4 sm:pt-3">
          <p className="text-xs tracking-wide text-ink-soft">
            {title}
            {location ? (
              <>
                <br />
                {location}
              </>
            ) : null}
          </p>
          {heroImageUrl ? (
            <div className="relative h-28 w-28 overflow-hidden rounded-full border border-line sm:h-32 sm:w-32">
              <Image
                src={heroImageUrl}
                alt={name}
                fill
                sizes="128px"
                className="object-cover"
                priority
              />
            </div>
          ) : null}
        </div>

        <div>
          <h1 className="font-display text-4xl leading-[1.1] text-ink sm:text-5xl">
            {name}
          </h1>
          <p className="mt-4 max-w-md text-lg text-ink-soft">{tagline}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            {calendlyUrl ? (
              <a
                href="#contact"
                className="rounded-none border border-ink bg-ink px-5 py-2.5 text-sm text-paper transition-colors hover:bg-transparent hover:text-ink"
              >
                Book a call
              </a>
            ) : null}
            <a
              href={`mailto:${contactEmail}`}
              className="rounded-none border border-line px-5 py-2.5 text-sm text-ink transition-colors hover:border-ink"
            >
              Email {name.split(" ")[0]}
            </a>
          </div>
        </div>
      </div>

      <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-line pt-8">
        <Stat label="Years" value={yearsExperience} />
        <Stat label="Clients" value={clientsServed} />
        <Stat label="Projects" value={projectsDone} />
      </dl>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-soft">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-3xl text-ink sm:text-4xl">
        <CountUp to={value} />
      </dd>
    </div>
  );
}
