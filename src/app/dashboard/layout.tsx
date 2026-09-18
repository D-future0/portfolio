import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTenantByOwnerId } from "@/lib/content";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  if (session.user.role !== "TENANT" || !session.user.tenantId) {
    redirect("/admin/login");
  }

  const tenant = await getTenantByOwnerId(session.user.id);
  if (!tenant) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-paper">
      <DashboardNav
        tenant={{
          slug: tenant.slug,
          plan: tenant.plan,
          published: tenant.published,
          trialEndsAt: tenant.trialEndsAt,
        }}
      />
      <main className="mx-auto max-w-3xl px-6 py-10">{children}</main>
    </div>
  );
}