import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactFormSchema } from "@/lib/validation";
import { getProfile } from "@/lib/content";
import { db } from "@/lib/db";
import { clientKey, limitedResponse, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limit = await rateLimit(clientKey(request, "contact"), 5, 15 * 60 * 1000);
  if (!limit.allowed) return limitedResponse(limit.resetAt);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again." },
      { status: 400 },
    );
  }

  // Honeypot tripped — silently pretend success so bots don't learn.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  const tenantSlug = request.headers.get("x-portfolio-slug");
  if (!tenantSlug) {
    return NextResponse.json({ error: "Portfolio context is required." }, { status: 400 });
  }
  const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) {
    return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
  }
  const profile = await getProfile(tenant.id);
  if (!profile) {
    return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
  }
  const { name, email, message } = parsed.data;

  await db.contactMessage.create({ data: { tenantId: tenant.id, name, email, message } });
  await db.analyticsEvent.create({ data: { tenantId: tenant.id, type: "contact", path: `/u/${tenantSlug}` } });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: true, inboxOnly: true });
  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL ?? "portfolio@resend.dev",
      to: profile.contactEmail,
      replyTo: email,
      subject: `New portfolio message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
  } catch (err) {
    console.error("Failed to send contact email:", err);
    return NextResponse.json(
      { error: "Could not send your message. Please try again shortly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
