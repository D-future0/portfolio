import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTenantByOwnerId } from "@/lib/content";
import { ProjectsManager } from "@/components/dashboard/projects-manager";

export const revalidate = 0;

export default async function DashboardProjectsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT" || !session.user.tenantId) {
    redirect("/admin/login");
  }

  const tenant = await getTenantByOwnerId(session.user.id);
  if (!tenant) redirect("/admin/login");

  return (
    <div>
      <ProjectsManager
        tenantId={tenant.id}
        items={tenant.projects.map((p) => ({
          id: p.id,
          title: p.title,
          summary: p.summary,
          description: p.description,
          client: p.client,
          imageUrl: p.imageUrl,
          tags: p.tags,
          order: p.order,
        }))}
      />
    </div>
  );
}