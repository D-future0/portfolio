import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTenantByOwnerId } from "@/lib/content";
import { db } from "@/lib/db";

export const revalidate = 0;

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT") redirect("/admin/login");
  const tenant = await getTenantByOwnerId(session.user.id);
  if (!tenant) redirect("/admin/login");
  const messages = await db.contactMessage.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: "desc" }, take: 100 });
  return <div><h1 className="font-display text-2xl italic text-ink">Contact inbox</h1><p className="mt-2 text-sm text-ink-soft">Messages from your public portfolio.</p><ul className="mt-8 divide-y divide-line border-t border-line">{messages.map((message) => <li key={message.id} className="py-5"><div className="flex justify-between gap-4"><p className="text-ink">{message.name} <span className="text-ink-soft">&lt;{message.email}&gt;</span></p><time className="text-xs text-ink-soft">{message.createdAt.toLocaleDateString()}</time></div><p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">{message.message}</p></li>)}{messages.length === 0 ? <li className="py-6 text-sm text-ink-soft">Your inbox is empty.</li> : null}</ul></div>;
}