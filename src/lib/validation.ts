import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const profileSchema = z.object({
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
