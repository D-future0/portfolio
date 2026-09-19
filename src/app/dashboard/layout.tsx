import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTenantByOwnerId } from "@/lib/content";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { trialDaysRemaining } from "@/lib/trial";

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
    redirect(session.user.role === "ADMIN" ? "/admin" : "/admin/login");
  }

  const tenant = await getTenantByOwnerId(session.user.id);
  if (!tenant) {
    redirect("/admin/login?error=workspace");
  }
  if (!tenant.onboardingCompleted) {
    redirect("/onboarding");
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
      {tenant.plan !== "PRO" ? (
        <div className="border-b border-line bg-paper-raised px-6 py-3 text-center text-sm text-ink-soft">
          {trialDaysRemaining(tenant.trialEndsAt) > 0
            ? `${trialDaysRemaining(tenant.trialEndsAt)} days left in your free trial.`
            : "Your free trial has ended. Your content is safe, but premium features are paused."}{" "}
          <a href="/dashboard/billing" className="text-ink underline underline-offset-4">View billing</a>
        </div>
      ) : null}
      <main className="mx-auto max-w-3xl px-6 py-10">{children}</main>
    </div>
  );
}