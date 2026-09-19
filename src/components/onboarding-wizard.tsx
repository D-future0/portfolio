"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "@/lib/actions";
import { getProfessionExample, PROFESSIONS, TEMPLATES } from "@/lib/onboarding";

export function OnboardingWizard({ name }: { name: string }) {
  const router = useRouter();
  const [profession, setProfession] = useState("consultant");
  const [customProfession, setCustomProfession] = useState("");
  const [template, setTemplate] = useState("editorial");
  const example = getProfessionExample(profession);
  const [title, setTitle] = useState(example.title);
  const [heroTagline, setHeroTagline] = useState(example.tagline);
  const [bio, setBio] = useState(example.bio);
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    setPending(true);
    setError(null);
    const selectedProfession = profession === "custom" ? customProfession.trim() : profession;
    const result = await completeOnboarding({ profession: selectedProfession, template, title, heroTagline, bio });
    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">Set up your workspace</p>
      <h1 className="mt-4 font-display text-4xl italic text-ink">Let&apos;s make {name}&apos;s work visible.</h1>
      <p className="mt-3 max-w-xl text-ink-soft">Choose a starting point. You can change every word and image from the dashboard.</p>

      {step === 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-xl italic text-ink">What kind of professional are you?</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {PROFESSIONS.map((item) => (
              <button key={item.key} onClick={() => { setProfession(item.key); const next = getProfessionExample(item.key); setTitle(next.title); setHeroTagline(next.tagline); setBio(next.bio); }} className={`border p-4 text-left ${profession === item.key ? "border-ink bg-paper-raised" : "border-line"}`}>
                <span className="block text-sm text-ink">{item.label}</span>
                <span className="mt-1 block text-xs text-ink-soft">{item.description}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setProfession("custom")}
              className={`border p-4 text-left ${profession === "custom" ? "border-ink bg-paper-raised" : "border-line"}`}
            >
              <span className="block text-sm text-ink">Other</span>
              <span className="mt-1 block text-xs text-ink-soft">Add your own profession or specialty.</span>
            </button>
          </div>
          {profession === "custom" ? (
            <label className="mt-5 flex max-w-md flex-col gap-1.5 text-sm">
              Your profession
              <input
                value={customProfession}
                onChange={(event) => setCustomProfession(event.target.value)}
                placeholder="e.g. Architect, researcher, photographer"
                maxLength={80}
                className="border border-line bg-paper-raised px-3 py-2"
                required
              />
            </label>
          ) : null}
          <button onClick={() => setStep(1)} className="mt-8 border border-ink bg-ink px-5 py-2.5 text-sm text-paper">Continue</button>
        </section>
      ) : step === 1 ? (
        <section className="mt-10">
          <h2 className="font-display text-xl italic text-ink">Choose a visual direction</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {TEMPLATES.map((item) => (
              <button key={item.key} onClick={() => setTemplate(item.key)} className={`border p-4 text-left ${template === item.key ? "border-ink bg-paper-raised" : "border-line"}`}>
                <span className="block text-sm text-ink">{item.label}</span>
                <span className="mt-1 block text-xs text-ink-soft">{item.description}</span>
              </button>
            ))}
          </div>
          {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
          <div className="mt-8 flex gap-4">
            <button onClick={() => setStep(0)} className="text-sm text-ink-soft underline">Back</button>
            <button onClick={() => setStep(2)} className="border border-ink bg-ink px-5 py-2.5 text-sm text-paper">Continue</button>
          </div>
        </section>
      ) : (
        <section className="mt-10">
          <h2 className="font-display text-xl italic text-ink">Shape your introduction</h2>
          <div className="mt-5 flex max-w-xl flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">Professional title<input value={title} onChange={(event) => setTitle(event.target.value)} className="border border-line bg-paper-raised px-3 py-2" /></label>
            <label className="flex flex-col gap-1.5 text-sm">Tagline<input value={heroTagline} onChange={(event) => setHeroTagline(event.target.value)} className="border border-line bg-paper-raised px-3 py-2" /></label>
            <label className="flex flex-col gap-1.5 text-sm">Short bio<textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={5} className="border border-line bg-paper-raised px-3 py-2" /></label>
          </div>
          {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
          <div className="mt-8 flex gap-4">
            <button onClick={() => setStep(1)} className="text-sm text-ink-soft underline">Back</button>
            <button disabled={pending} onClick={finish} className="border border-ink bg-ink px-5 py-2.5 text-sm text-paper disabled:opacity-50">{pending ? "Publishing..." : "Publish my portfolio"}</button>
          </div>
        </section>
      )}
    </main>
  );
}