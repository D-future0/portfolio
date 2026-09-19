import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTenantByOwnerId } from "@/lib/content";
import { OnboardingWizard } from "@/components/onboarding-wizard";

export const revalidate = 0;

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "TENANT") redirect("/admin");
  const tenant = await getTenantByOwnerId(session.user.id);
  if (!tenant) redirect("/admin?error=workspace");
  if (tenant.onboardingCompleted) redirect("/dashboard");

  return <OnboardingWizard name={tenant.profile?.name ?? tenant.name} />;
}