"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  profileSchema,
  experienceSchema,
  projectSchema,
  certificationSchema,
} from "@/lib/validation";

// Every action re-checks the session itself. Next.js middleware is a
// convenience redirect, not a trusted auth boundary (CVE-2025-29927 showed
// middleware-only checks can be bypassed) — so mutations must never rely on
// it alone.
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
}

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateProfile(
  raw: unknown,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = profileSchema.parse(raw);
    await db.profile.upsert({
      where: { id: "profile" },
      create: { id: "profile", ...data },
      update: data,
    });
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

export async function upsertExperience(raw: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = experienceSchema.parse(raw);
    const { id, ...fields } = data;
    if (id) {
      await db.experience.update({ where: { id }, data: fields });
    } else {
      await db.experience.create({ data: fields });
    }
    revalidatePath("/");
    revalidatePath("/admin/experience");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

export async function deleteExperience(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.experience.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/experience");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

export async function upsertProject(raw: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = projectSchema.parse(raw);
    const { id, ...fields } = data;
    if (id) {
      await db.project.update({ where: { id }, data: fields });
    } else {
      await db.project.create({ data: fields });
    }
    revalidatePath("/");
    revalidatePath("/admin/projects");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.project.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/projects");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

export async function upsertCertification(
  raw: unknown,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = certificationSchema.parse(raw);
    const { id, ...fields } = data;
    if (id) {
      await db.certification.update({ where: { id }, data: fields });
    } else {
      await db.certification.create({ data: fields });
    }
    revalidatePath("/");
    revalidatePath("/admin/certifications");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

export async function deleteCertification(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.certification.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/certifications");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: message(err) };
  }
}

function message(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}
