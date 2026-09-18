import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTenantByOwnerId } from "@/lib/content";
import { UpgradeButton } from "@/components/dashboard/upgrade-button";
import { PublishToggle } from "@/components/dashboard/publish-toggle";

export const revalidate = 0;

export default async function DashboardBillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT" || !session.user.tenantId) {
    redirect("/admin/login");
  }

  const tenant = await getTenantByOwnerId(session.user.id);
  if (!tenant) redirect("/admin/login");

  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : undefined;
  const reference = typeof params.reference === "string" ? params.reference : undefined;

  // After Paystack redirects back, verify the transaction so we can record
  // the card authorization and create the subscription.
  if (status === "success" && reference) {
    try {
      const verifyRes = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const verify = await verifyRes.json();
      if (verify.ok && verify.authorizationCode) {
        const planRes = await fetch("/api/paystack/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId: tenant.id,
            customer: session.user.email,
            plan: "pro",
            authorization: verify.authorizationCode,
          }),
        });
        if (!planRes.ok) {
          // Surface the error but keep the page usable.
          console.error("Subscription creation failed", await planRes.json());
        }
      }
    } catch (err) {
      console.error("Billing callback handling failed", err);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl italic text-ink">Billing</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Manage your plan and whether your portfolio is publicly visible.
        </p>
      </div>

      <section className="rounded border border-line bg-paper-raised p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-soft">Current plan</p>
            <p className="font-display text-xl text-ink">
              {tenant.plan === "PRO" ? "Pro" : "Free"}
            </p>
            {tenant.trialEndsAt ? (
              <p className="text-xs text-ink-soft">
                Trial ends {tenant.trialEndsAt.toLocaleDateString()}
              </p>
            ) : null}
          </div>
          {tenant.plan === "FREE" ? (
            <UpgradeButton
              tenantId={tenant.id}
              planCode="pro"
              amount={5000}
              currency="NGN"
              email={session.user.email!}
            />
          ) : (
            <span className="text-sm text-ink-soft">Active</span>
          )}
        </div>
      </section>

      <PublishToggle tenantId={tenant.id} slug={tenant.slug} published={tenant.published} />
    </div>
  );
}