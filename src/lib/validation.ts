import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Slugs: lowercase letters, digits, hyphens. 3-32 chars. No leading/trailing
// hyphen. Reserves "admin" so it never collides with the login route.
export const slugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .max(32, "Slug must be at most 32 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and hyphens (no leading/trailing hyphen)",
  )
  .refine((s) => s !== "admin", "That slug is reserved");

export const signupSchema = z.object({
  name: z.string().min(1, "Enter your name").max(120),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  workspaceName: z.string().min(1, "Enter a workspace name").max(160),
  slug: slugSchema,
});

// Admin: create a tenant + its owner account in one shot.
export const createTenantSchema = z.object({
  ownerEmail: z.string().email("Enter a valid email"),
  ownerName: z.string().min(1).max(120).optional(),
  ownerPassword: z.string().min(8, "Password must be at least 8 characters"),
  slug: slugSchema,
  name: z.string().min(1).max(160),
  title: z.string().min(1).max(160).default("Independent Professional"),
  plan: z.enum(["FREE", "PRO"]).default("FREE"),
  published: z.boolean().default(true),
  approved: z.boolean().default(true),
});

// Admin: edit an existing tenant (no owner/password changes here).
export const updateTenantSchema = z.object({
  id: z.string(),
  slug: slugSchema,
  name: z.string().min(1).max(160),
  title: z.string().min(1).max(160),
  plan: z.enum(["FREE", "PRO"]),
  published: z.boolean(),
  approved: z.boolean(),
});

// Owner: change their own password.
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

// Owner: toggle publish on their own portfolio.
export const publishSchema = z.object({
  tenantId: z.string(),
  published: z.boolean(),
});

export const profileSchema = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1).max(120),
  title: z.string().min(1).max(160),
  heroTagline: z.string().min(1).max(240),
  heroImageUrl: z.string().url().nullable().optional(),
  bio: z.string().min(1).max(4000),
  yearsExperience: z.coerce.number().int().min(0).max(80),
  clientsServed: z.coerce.number().int().min(0).max(100000),
  projectsDone: z.coerce.number().int().min(0).max(100000),
  contactEmail: z.string().email(),
  phone: z.string().max(40).nullable().optional(),
  location: z.string().max(120).nullable().optional(),
  calendlyUrl: z.string().url().nullable().optional().or(z.literal("")),
  linkedinUrl: z.string().url().nullable().optional().or(z.literal("")),
  twitterUrl: z.string().url().nullable().optional().or(z.literal("")),
  resumeUrl: z.string().url().nullable().optional().or(z.literal("")),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color like #B08D57"),
});

export const experienceSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string().min(1),
  company: z.string().min(1).max(160),
  role: z.string().min(1).max(160),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
  current: z.boolean().default(false),
  location: z.string().max(120).nullable().optional(),
  bullets: z.array(z.string().min(1).max(400)).max(12),
  order: z.coerce.number().int().default(0),
});

export const projectSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string().min(1),
  title: z.string().min(1).max(160),
  summary: z.string().min(1).max(300),
  description: z.string().max(4000).nullable().optional(),
  client: z.string().max(160).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  tags: z.array(z.string().min(1).max(40)).max(10),
  order: z.coerce.number().int().default(0),
});

export const certificationSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string().min(1),
  name: z.string().min(1).max(200),
  issuer: z.string().min(1).max(160),
  issueDate: z.coerce.date().nullable().optional(),
  credentialUrl: z.string().url().nullable().optional().or(z.literal("")),
  order: z.coerce.number().int().default(0),
});

export const contactFormSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(1).max(4000),
  // honeypot field — real users never fill this in
  company: z.string().max(0).optional(),
});
