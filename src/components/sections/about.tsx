import { Reveal } from "@/components/reveal";

export function About({ bio }: { bio: string }) {
  return (
    <section id="about" className="border-t border-line">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 py-16 sm:grid-cols-[160px_1fr] sm:gap-8">
        <h2 className="font-display text-sm italic text-ink-soft">About</h2>
        <Reveal>
          <p className="max-w-2xl whitespace-pre-line text-lg leading-relaxed text-ink">
            {bio}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
