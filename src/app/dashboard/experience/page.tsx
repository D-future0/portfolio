import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTenantByOwnerId } from "@/lib/content";
import { ExperienceManager } from "@/components/dashboard/experience-manager";

export const revalidate = 0;

export default async function DashboardExperiencePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT" || !session.user.tenantId) {
    redirect("/admin/login");
  }

  const tenant = await getTenantByOwnerId(session.user.id);
  if (!tenant) redirect("/admin/login");

  return (
    <div>
      <ExperienceManager
        tenantId={tenant.id}
        items={tenant.experiences.map((e) => ({
          id: e.id,
          company: e.company,
          role: e.role,
          startDate: e.startDate.toISOString().slice(0, 10),
          endDate: e.endDate ? e.endDate.toISOString().slice(0, 10) : null,
          current: e.current,
          location: e.location,
          bullets: e.bullets,
          order: e.order,
        }))}
      />
    </div>
  );
}