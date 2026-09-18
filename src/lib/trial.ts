export function trialDaysRemaining(trialEndsAt: Date | null, now = new Date()) {
  if (!trialEndsAt) return 0;
  return Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / 86_400_000));
}

export function isTrialActive(tenant: { plan: string; trialEndsAt: Date | null }) {
  return tenant.plan === "PRO" || trialDaysRemaining(tenant.trialEndsAt) > 0;
}
