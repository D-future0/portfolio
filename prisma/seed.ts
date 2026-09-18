import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const DEMO_TENANT_SLUG = "demo";
const DEMO_OWNER_EMAIL = "demo@portfolio.local";
const DEMO_PASSWORD = "demo-demo-123";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in your environment before seeding.",
    );
  }
  if (adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  // 1. Superuser admin (never owns a tenant).
  const adminHash = await bcrypt.hash(adminPassword, 12);
  const admin = await db.user.upsert({
    where: { email: adminEmail },
    create: { email: adminEmail, passwordHash: adminHash, name: "Admin", role: "ADMIN" },
    update: { passwordHash: adminHash, role: "ADMIN" },
  });

  // 2. Demo tenant + owner. The existing singleton Profile and any
  //    Experience/Project/Certification rows are migrated into this tenant.
  const demoOwner = await db.user.upsert({
    where: { email: DEMO_OWNER_EMAIL },
    create: { email: DEMO_OWNER_EMAIL, passwordHash: await bcrypt.hash(DEMO_PASSWORD, 12), name: "Demo Portfolio", role: "TENANT" },
    update: { role: "TENANT" },
  });

  const demoTenant = await db.tenant.upsert({
    where: { slug: DEMO_TENANT_SLUG },
    create: { slug: DEMO_TENANT_SLUG, name: "Demo Portfolio", title: "Independent Professional", published: true, approvedAt: new Date(), trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), ownerId: demoOwner.id },
    update: { ownerId: demoOwner.id, published: true, approvedAt: new Date() },
  });

  // 3. Migrate the legacy singleton Profile (id "profile") into the demo tenant.
  const legacyProfile = await db.profile.findFirst({ where: { tenantId: "" } });
  if (legacyProfile) {
    const { id: _id, tenantId: _tenantId, ...fields } = legacyProfile;
    await db.profile.upsert({
      where: { id_tenantId: { id: "profile", tenantId: demoTenant.id } },
      create: { id: "profile", tenantId: demoTenant.id, ...fields },
      update: { ...fields },
    });
  } else {
    await db.profile.upsert({
      where: { id_tenantId: { id: "profile", tenantId: demoTenant.id } },
      create: { id: "profile", tenantId: demoTenant.id },
      update: {},
    });
  }

  // 4. Migrate any legacy content rows that still have no tenant into demo.
  await db.experience.updateMany({
    where: { tenantId: "" },
    data: { tenantId: demoTenant.id },
  });
  await db.project.updateMany({ where: { tenantId: "" }, data: { tenantId: demoTenant.id } });
  await db.certification.updateMany({
    where: { tenantId: "" },
    data: { tenantId: demoTenant.id },
  });

  // 5. Paystack plan catalog (free trial + pro). Codes are filled in once
  //    the Paystack integration is configured; rows exist so the app can
  //    reference plans by key immediately.
  await db.plan.upsert({
    where: { key: "free" },
    create: { key: "free", amount: 0, interval: "monthly", currency: "NGN" },
    update: {},
  });
  await db.plan.upsert({
    where: { key: "pro" },
    create: { key: "pro", amount: 0, interval: "monthly", currency: "NGN" },
    update: {},
  });

  console.log(`Admin superuser ready: ${admin.email}`);
  console.log(`Demo tenant ready: /u/${demoTenant.slug} (owner ${demoOwner.email})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });