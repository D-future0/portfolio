import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTenantByOwnerId } from "@/lib/content";
import { db } from "@/lib/db";

export const revalidate = 0;

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT") redirect("/admin/login");
  const tenant = await getTenantByOwnerId(session.user.id);
  if (!tenant) redirect("/admin/login");
  const [views, contacts, clicks, projects] = await Promise.all([
    db.analyticsEvent.count({ where: { tenantId: tenant.id, type: "view" } }),
    db.contactMessage.count({ where: { tenantId: tenant.id } }),
    db.analyticsEvent.count({ where: { tenantId: tenant.id, type: "link_click" } }),
    db.analyticsEvent.groupBy({ by: ["projectId"], where: { tenantId: tenant.id, type: "project_view", projectId: { not: null } }, _count: { projectId: true }, orderBy: { _count: { projectId: "desc" } }, take: 5 }),
  ]);
  return <div><h1 className="font-display text-2xl italic text-ink">Analytics</h1><div className="mt-8 grid gap-4 sm:grid-cols-3"><Metric label="Portfolio views" value={views} /><Metric label="Contact submissions" value={contacts} /><Metric label="Tracked link clicks" value={clicks} /></div><section className="mt-10 border-t border-line pt-6"><h2 className="font-display text-lg italic text-ink">Most-viewed projects</h2><ul className="mt-4 divide-y divide-line border-t border-line">{projects.map((project) => <li key={project.projectId} className="flex justify-between py-3 text-sm"><span>{project.projectId}</span><span className="text-ink-soft">{project._count.projectId} views</span></li>)}</ul></section></div>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="border border-line bg-paper-raised p-5"><p className="text-sm text-ink-soft">{label}</p><p className="mt-2 font-display text-3xl text-ink">{value}</p></div>; }