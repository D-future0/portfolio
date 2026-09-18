"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  profileSchema,
  experienceSchema,
  projectSchema,
  certificationSchema,
  createTenantSchema,
  updateTenantSchema,
  changePasswordSchema,
  publishSchema,
  signupSchema,
} from "@/lib/validation";

export type ActionResult = { ok: true } | { ok: false; error: string };

function message(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}

async function requireOwner(tenantId: string) {
  const session = await requireSession();
  if (session.user.role !== "TENANT") throw new Error("Forbidden");
  if (session.user.tenantId !== tenantId) throw new Error("Forbidden");
  return session;
}

async function scopeTenantId(session: any, explicit: string | undefined) {
  if (session.user.role === "TENANT") return session.user.tenantId;
  if (explicit) return explicit;
  throw new Error("ADMIN mutations must specify a tenantId");
}

function trialEndDate() {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 30);
  return trialEndsAt;
}

export async function registerTenant(raw: unknown): Promise<ActionResult> {
  try {
    const data = signupSchema.parse(raw);
    const passwordHash = await (await import("bcryptjs")).default.hash(data.password, 12);
    const trialEndsAt = trialEndDate();

    await db.$transaction(async (tx) => {
      const owner = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash,
          role: "TENANT",
        },
      });
      const tenant = await tx.tenant.create({
        data: {
          slug: data.slug,
          name: data.workspaceName,
          title: "Independent Professional",
          published: true,
          approvedAt: new Date(),
          trialEndsAt,
          ownerId: owner.id,
        },
      });
      await tx.profile.create({ data: { id: "profile", tenantId: tenant.id, name: data.name } });
    });

    return { ok: true };
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return { ok: false, error: "That email or workspace URL is already in use." };
    }
    return { ok: false, error: message(err) };
  }
}

export async function updateProfile(raw: unknown): Promise<ActionResult> {
  try {
    const session = await requireSession();
    const data = profileSchema.parse(raw);
    const tenantId = await scopeTenantId(session, data.tenantId);
    await db.profile.upsert({
      where: { id_tenantId: { id: "profile", tenantId } },
      create: { ...data, id: "profile", tenantId },
      update: { ...data, tenantId },
    });
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (tenant) revalidatePath(`/u/${tenant.slug}`);
    revalidatePath(`/dashboard`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

export async function upsertExperience(raw: unknown): Promise<ActionResult> {
  try {
    const session = await requireSession();
    const data = experienceSchema.parse(raw);
    const tenantId = await scopeTenantId(session, data.tenantId);
    const { id, tenantId: _t, ...fields } = data;
    if (id) {
      await db.experience.update({ where: { id_tenantId: { id, tenantId } }, data: fields });
    } else {
      await db.experience.create({ data: { tenantId, ...fields } });
    }
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (tenant) revalidatePath(`/u/${tenant.slug}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

export async function deleteExperience(id: string, tenantId: string): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await scopeTenantId(session, tenantId);
    await db.experience.delete({ where: { id_tenantId: { id, tenantId } } });
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (tenant) revalidatePath(`/u/${tenant.slug}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

export async function upsertProject(raw: unknown): Promise<ActionResult> {
  try {
    const session = await requireSession();
    const data = projectSchema.parse(raw);
    const tenantId = await scopeTenantId(session, data.tenantId);
    const { id, tenantId: _t, ...fields } = data;
    if (id) {
      await db.project.update({ where: { id_tenantId: { id, tenantId } }, data: fields });
    } else {
      await db.project.create({ data: { tenantId, ...fields } });
    }
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (tenant) revalidatePath(`/u/${tenant.slug}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

export async function deleteProject(id: string, tenantId: string): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await scopeTenantId(session, tenantId);
    await db.project.delete({ where: { id_tenantId: { id, tenantId } } });
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (tenant) revalidatePath(`/u/${tenant.slug}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

export async function upsertCertification(raw: unknown): Promise<ActionResult> {
  try {
    const session = await requireSession();
    const data = certificationSchema.parse(raw);
    const tenantId = await scopeTenantId(session, data.tenantId);
    const { id, tenantId: _t, ...fields } = data;
    if (id) {
      await db.certification.update({ where: { id_tenantId: { id, tenantId } }, data: fields });
    } else {
      await db.certification.create({ data: { tenantId, ...fields } });
    }
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (tenant) revalidatePath(`/u/${tenant.slug}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

export async function deleteCertification(id: string, tenantId: string): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await scopeTenantId(session, tenantId);
    await db.certification.delete({ where: { id_tenantId: { id, tenantId } } });
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (tenant) revalidatePath(`/u/${tenant.slug}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}
// --- Tenant management (admin only) ---

export async function createTenant(raw: unknown): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const data = createTenantSchema.parse(raw);
    const passwordHash = await (await import("bcryptjs")).default.hash(data.ownerPassword, 12);

    const tenant = await db.tenant.create({
      data: {
        slug: data.slug,
        name: data.name,
        title: data.title,
        plan: data.plan,
        published: data.published,
        approvedAt: data.approved ? new Date() : null,
        owner: {
          create: {
            email: data.ownerEmail,
            name: data.ownerName ?? null,
            passwordHash,
            role: "TENANT",
          },
        },
      },
      include: { owner: true },
    });

    // Auto-create the singleton Profile row for this tenant.
    await db.profile.create({ data: { id: "profile", tenantId: tenant.id } });

    revalidatePath("/admin/tenants");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

export async function updateTenant(raw: unknown): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const data = updateTenantSchema.parse(raw);

    const tenant = await db.tenant.update({
      where: { id: data.id },
      data: {
        slug: data.slug,
        name: data.name,
        title: data.title,
        plan: data.plan,
        published: data.published,
        approvedAt: data.approved ? ((await tenantApprovedAt(data.id)) ?? new Date()) : null,
      },
    });

    revalidatePath("/admin/tenants");
    revalidatePath(`/u/${tenant.slug}`);
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

async function tenantApprovedAt(id: string): Promise<Date | null> {
  const t = await db.tenant.findUnique({ where: { id }, select: { approvedAt: true } });
  return t?.approvedAt ?? null;
}

export async function deleteTenant(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    // Cascade deletes content + subscriptions; the owner User is left alone
    // (an admin might reuse the email for a new tenant later).
    await db.tenant.delete({ where: { id } });
    revalidatePath("/admin/tenants");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

// --- Owner-only actions ---

export async function changePassword(raw: unknown): Promise<ActionResult> {
  try {
    const session = await requireSession();
    const data = changePasswordSchema.parse(raw);

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) throw new Error("User not found");
    const ok = await (await import("bcryptjs")).default.compare(
      data.currentPassword,
      user.passwordHash,
    );
    if (!ok) throw new Error("Current password is incorrect");

    const hash = await (await import("bcryptjs")).default.hash(data.newPassword, 12);
    await db.user.update({ where: { id: user.id }, data: { passwordHash: hash } });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

export async function setPublished(raw: unknown): Promise<ActionResult> {
  try {
    const session = await requireSession();
    const data = publishSchema.parse(raw);
    await requireOwner(data.tenantId);

    const tenant = await db.tenant.update({
      where: { id: data.tenantId },
      data: { published: data.published },
    });
    revalidatePath(`/u/${tenant.slug}`);
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}
