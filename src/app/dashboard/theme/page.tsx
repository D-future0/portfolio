import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTenantByOwnerId } from "@/lib/content";
import { ThemeForm } from "@/components/dashboard/theme-form";

export const revalidate = 0;

export default async function DashboardThemePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT" || !session.user.tenantId) {
    redirect("/admin/login");
  }

  const tenant = await getTenantByOwnerId(session.user.id);
  if (!tenant || !tenant.profile) redirect("/admin/login");

  const p = tenant.profile;
  return (
    <ThemeForm
      tenantId={tenant.id}
      slug={tenant.slug}
      accentColor={p.accentColor}
      profile={p}
    />
  );
}