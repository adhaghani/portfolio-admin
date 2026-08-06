import { z } from "zod"
import { getReadingTime } from "@/lib/reading-time"

// ---------------------------------------------------------------------------
// Shared blocks
// ---------------------------------------------------------------------------

export const projectBlockSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  body: z.string().min(1, "Body is required"),
})

// ---------------------------------------------------------------------------
// Blog Posts
// ---------------------------------------------------------------------------

export const blogPostSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase kebab-case",
    ),
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  excerpt: z.string().max(300, "Excerpt must be under 300 characters").default(""),
  tags: z.array(z.string()).default([]),
  cover_image: z.string().nullable().default(null),
  content: z.string().min(1, "Content is required"),
  reading_time: z.number().int().min(1).default(1),
  published: z.boolean().default(false),
})

export type BlogPostFormValues = z.infer<typeof blogPostSchema>

export function computeReadingTime(content: string): number {
  return Math.max(1, getReadingTime(content))
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const projectSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase kebab-case",
    ),
  title: z.string().min(1, "Title is required"),
  tagline: z.string().max(120, "Tagline must be under 120 characters").default(""),
  description: z.string().min(1, "Description is required"),
  technologies: z.array(z.string()).default([]),
  year: z.string().min(1, "Year is required"),
  cover_image: z.string().nullable().default(null),
  live_url: z.string().url("Must be a valid URL").nullable().or(z.literal("")).default(null),
  repo_url: z.string().url("Must be a valid URL").nullable().or(z.literal("")).default(null),
  featured: z.boolean().default(false),
  thinking: z.array(projectBlockSchema).default([]),
  results: z.array(projectBlockSchema).default([]),
})

export type ProjectFormValues = z.infer<typeof projectSchema>

// ---------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------

export const educationSchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().default(""),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  description: z.string().max(500, "Description must be under 500 characters").default(""),
  highlights: z.array(z.string()).default([]),
  gpa: z.string().nullable().default(null),
  courses: z.array(z.string()).default([]),
  sort_order: z.number().int().default(0),
})

export type EducationFormValues = z.infer<typeof educationSchema>

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

export const activityTypeEnum = z.enum([
  "program",
  "ambassadorship",
  "involvement",
])

export const activitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  organization: z.string().min(1, "Organization is required"),
  type: activityTypeEnum,
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().nullable().default(null),
  description: z.string().max(500, "Description must be under 500 characters").default(""),
  contributions: z.array(z.string()).default([]),
  takeaway: z.string().nullable().default(null),
  image: z.string().nullable().default(null),
  sort_order: z.number().int().default(0),
})

export type ActivityFormValues = z.infer<typeof activitySchema>

// ---------------------------------------------------------------------------
// Certificates
// ---------------------------------------------------------------------------

export const certificateSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase kebab-case",
    ),
  title: z.string().min(1, "Title is required"),
  issuer: z.string().min(1, "Issuer is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().nullable().default(null),
  url: z
    .string()
    .url("Must be a valid URL")
    .refine((url) => url.startsWith("https://"), {
      message: "URL must start with https://",
    }),
  credential_id: z.string().nullable().default(null),
  sort_order: z.number().int().default(0),
})

export type CertificateFormValues = z.infer<typeof certificateSchema>
