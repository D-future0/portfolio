import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTenantByOwnerId } from "@/lib/content";
import { CertificationsManager } from "@/components/dashboard/certifications-manager";

export const revalidate = 0;

export default async function DashboardCertificationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT" || !session.user.tenantId) {
    redirect("/admin/login");
  }

  const tenant = await getTenantByOwnerId(session.user.id);
  if (!tenant) redirect("/admin/login");

  return (
    <div>
      <CertificationsManager
        tenantId={tenant.id}
        items={tenant.certifications.map((c) => ({
          id: c.id,
          name: c.name,
          issuer: c.issuer,
          issueDate: c.issueDate ? c.issueDate.toISOString().slice(0, 10) : null,
          credentialUrl: c.credentialUrl,
          order: c.order,
        }))}
      />
    </div>
  );
}