import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTenantByOwnerId } from "@/lib/content";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const revalidate = 0;

export default async function DashboardProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT" || !session.user.tenantId) {
    redirect("/admin/login");
  }

  const tenant = await getTenantByOwnerId(session.user.id);
  if (!tenant) redirect("/admin/login");

  const p = tenant.profile;
  if (!p) redirect("/admin/login");

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl italic text-ink">Profile &amp; hero</h1>
      <ProfileForm tenantId={tenant.id} slug={tenant.slug} profile={p} />
    </div>
  );
}