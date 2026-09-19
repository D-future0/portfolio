# Professional Portfolio SaaS

A multi-tenant portfolio SaaS for professionals, studios, and specialists.
Each workspace gets a public portfolio URL, a private editor, and a 30-day
free trial before upgrading to a paid plan.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 ·
Prisma 6 · PostgreSQL · Auth.js v5 · Framer Motion · Resend ·
Vercel Blob · Calendly

## 1. Local setup

```bash
npm install          # also runs `prisma generate` via postinstall
cp .env.example .env.local
```

Fill in `.env.local`:

- `DATABASE_URL` — a Postgres connection string. Easiest options: create a
  **Vercel Postgres** or **Neon** database and paste its connection string.
- `AUTH_SECRET` — generate with `npx auth secret`.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — only used once, to create your admin
  login (see step 2). Not read at runtime.
- `RESEND_API_KEY` — from resend.com, for the contact form to send you email.
- `CRON_SECRET` — a random secret used to authenticate daily trial reminder jobs.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` —
  Cloudinary credentials for image and PDF uploads.
- `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` — optional Sentry error monitoring DSNs.
- `SENTRY_TRACES_SAMPLE_RATE` / `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` — optional trace sampling rates.

Create and apply a development migration, then create your admin account:

```bash
npm run db:migrate
npm run db:seed
```

Run it:

```bash
npm run dev
```

Visit `/` for the public site, `/signup` to create a workspace with a 30-day
free trial, and `/admin/login` to sign in.

Trial reminders are sent by the `/api/cron/trial-reminders` Vercel Cron job.
Keep `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, and `CRON_SECRET` configured in
the deployment environment.

## 2. Deploying to Vercel

1. Push this repo to GitHub, then import it in Vercel.
2. In the Vercel project, go to **Storage** → create a **Postgres**
   database and a **Blob** store — both auto-populate their env vars.
3. Add the remaining env vars from `.env.example` (`AUTH_SECRET`,
   `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`) in **Settings → Environment
   Variables**.
4. Deploy. Then run the schema push + seed once against production, e.g.
   from your machine with the production `DATABASE_URL`:
   ```bash
  DATABASE_URL="<prod-url>" npm run db:migrate:deploy
   DATABASE_URL="<prod-url>" ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... npm run db:seed
   ```
5. Sign in at `yourdomain.com/admin/login`.

## 3. What's editable where

| Admin page                | Controls                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| Profile & hero (`/admin`) | Name, title, tagline, hero photo, bio, stats, contact email/phone, Calendly link, socials, resume link |
| Experience                | Add/edit/delete job history, with achievement bullets                                                  |
| Projects                  | Add/edit/delete projects, thumbnail, tags                                                              |
| Certifications             | Add/edit/delete credentials                                                                             |
| Theme                      | Accent color only — layout/type/animation are fixed                                                    |

The footer and overall design are intentionally not exposed to the admin
panel, per the original spec.

## 4. Security notes

- **Single admin, credentials-based.** Passwords are hashed with bcrypt
  (cost 12). There's no self-service signup — the only account is the one
  created by `db:seed`.
- **Auth is checked twice.** `middleware.ts` redirects unauthenticated
  visitors away from `/admin` for a smooth UX, but every server action and
  the protected layout **also** re-verify the session server-side. This is
  deliberate: a 2025 Next.js CVE (CVE-2025-29927) showed middleware-only
  auth checks can be bypassed with a crafted header, so this app never
  treats middleware as the actual security boundary.
- **Every mutation is Zod-validated** server-side, not just in the form UI.
- **Image uploads** are restricted by MIME type and 5MB size, and require
  an authenticated session.
- **Contact form** has a honeypot field and server-side validation to cut
  down spam; no CAPTCHA is included but can be added if needed.
- `next-auth`/`@auth/core` ships `nodemailer` as an optional dependency for
  its email-link login provider. This app doesn't use that provider (only
  Credentials), so the flagged nodemailer advisory doesn't apply to any
  code path this app actually runs — but it will still show up in
  `npm audit` since it's installed transitively.
- Run `npm audit` periodically and keep dependencies updated —
  especially `next`, `next-auth`, and `prisma`, which move fast.

## 5. Notes on the design system

Colors, typography, and animation live in `src/app/globals.css` as CSS
variables. The only one wired to the database is `--accent`, set from
`Profile.accentColor` in the root layout — that's what the Theme admin page
controls. Everything else (the ledger-row layout, Newsreader/IBM Plex
typography, hairline dividers, hero stat count-up) is fixed by design, per
the original spec.
