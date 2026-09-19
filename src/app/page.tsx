import Link from "next/link";
import { getPublishedTenants } from "@/lib/content";
import { Nav } from "@/components/sections/nav";

export const revalidate = 60;

export default async function Home() {
  const tenants = await getPublishedTenants();

  return (
    <>
      {/* <Nav name="Portfolios" /> */}
      <main className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-16 max-w-2xl">
          <p className="font-display text-4xl leading-[1.1] text-ink sm:text-5xl">
            Portfolios built for modern professionals.
          </p>
          <p className="mt-4 text-lg text-ink-soft">
            A growing directory of independent professionals, studios, and
            specialists — each with their own portfolio, live at their own URL.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="border border-ink bg-ink px-5 py-2.5 text-sm text-paper transition-colors hover:bg-transparent hover:text-ink"
            >
              Start your free trial
            </Link>
            <Link href="/admin/login" className="text-sm text-ink-soft underline underline-offset-4 hover:text-ink">
              Sign in
            </Link>
          </div>
        </div>

        {tenants.length === 0 ? (
          <p className="text-ink-soft">No portfolios published yet. Check back soon.</p>
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {tenants.map((t) => {
              const p = t.profile;
              return (
                <li key={t.id}>
                  <Link
                    href={`/u/${t.slug}`}
                    className="flex items-center justify-between gap-4 py-6 transition-colors hover:text-ink"
                  >
                    <div>
                      <p className="font-display text-xl text-ink">
                        {p?.name ?? t.name}
                      </p>
                      <p className="text-sm text-ink-soft">
                        {p?.title ?? t.title}
                        {p?.location ? ` · ${p.location}` : ""}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-ink-soft">
                      /u/{t.slug}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}