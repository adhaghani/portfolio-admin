// ---------------------------------------------------------------------------
// Supabase database types — mirrors the schema in schema.sql
// ---------------------------------------------------------------------------

export interface BlogRow {
  id: string
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[] // stored as jsonb array
  cover_image: string | null
  content: string
  reading_time: number
  published: boolean
  created_at: string
  updated_at: string
}

export interface ProjectRow {
  id: string
  slug: string
  title: string
  tagline: string
  description: string
  technologies: string[] // stored as jsonb array
  year: string
  cover_image: string | null
  live_url: string | null
  repo_url: string | null
  featured: boolean
  thinking: ProjectBlock[] // stored as jsonb
  results: ProjectBlock[] // stored as jsonb
  created_at: string
  updated_at: string
}

export interface ProjectBlock {
  heading: string
  body: string
}

export interface EducationRow {
  id: string
  institution: string
  degree: string
  field: string
  start_date: string
  end_date: string
  description: string
  highlights: string[] // stored as jsonb array
  gpa: string | null
  courses: string[] // stored as jsonb array
  sort_order: number
  created_at: string
}

export interface ActivityRow {
  id: string
  title: string
  organization: string
  type: "program" | "ambassadorship" | "involvement"
  start_date: string
  end_date: string | null
  description: string
  contributions: string[] // stored as jsonb array
  takeaway: string | null
  image: string | null
  sort_order: number
  created_at: string
}

export interface CertificateRow {
  id: string
  slug: string
  title: string
  issuer: string
  date: string
  description: string | null
  image: string | null
  url: string
  credential_id: string | null
  sort_order: number
  created_at: string
}

// ---------------------------------------------------------------------------
// Public-facing types (what the UI consumes)
// ---------------------------------------------------------------------------

export interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  coverImage?: string
  readingTime: number
  content: string
}

export interface Project {
  slug: string
  title: string
  tagline: string
  description: string
  technologies: string[]
  year: string
  coverImage?: string
  liveUrl?: string
  repoUrl?: string
  featured?: boolean
  thinking: ProjectBlock[]
  results: ProjectBlock[]
}

export interface EducationEntry {
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  description: string
  highlights?: string[]
  gpa?: string
  courses?: string[]
}

export type ActivityType = "program" | "ambassadorship" | "involvement"

export interface Activity {
  title: string
  organization: string
  type: ActivityType
  startDate: string
  endDate?: string
  description: string
  contributions?: string[]
  takeaway?: string
  image?: string
}

export interface Certificate {
  slug: string
  title: string
  issuer: string
  date: string
  description?: string
  image?: string
  url: string
  credentialId?: string
}
