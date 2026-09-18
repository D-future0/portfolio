import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/db";

const reminderDays = [14, 7, 3, 1] as const;

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "Email is not configured." }, { status: 503 });

  const now = new Date();
  const resend = new Resend(process.env.RESEND_API_KEY);
  let sent = 0;

  for (const days of reminderDays) {
    const start = new Date(now.getTime() + (days - 0.5) * 86_400_000);
    const end = new Date(now.getTime() + (days + 0.5) * 86_400_000);
    const field = `trialReminder${days}SentAt` as "trialReminder14SentAt" | "trialReminder7SentAt" | "trialReminder3SentAt" | "trialReminder1SentAt";
    const tenants = await db.tenant.findMany({
      where: { plan: "FREE", trialEndsAt: { gte: start, lte: end }, [field]: null },
      include: { owner: true },
    });

    for (const tenant of tenants) {
      await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL ?? "portfolio@resend.dev",
        to: tenant.owner.email,
        subject: `${days} days left in your free trial`,
        text: `Your professional portfolio trial ends in ${days} days. Upgrade from your dashboard to keep premium features active.`,
      });
      await db.tenant.update({ where: { id: tenant.id }, data: { [field]: new Date() } });
      sent += 1;
    }
  }

  return NextResponse.json({ ok: true, sent });
}