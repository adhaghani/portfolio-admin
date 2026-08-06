// ---------------------------------------------------------------------------
// Education data layer — Supabase-first with static fallback
// ---------------------------------------------------------------------------

import { getServerClient } from "@/lib/supabase/server"
import type {
  EducationEntry,
  Activity,
  ActivityType,
  EducationRow,
  ActivityRow,
} from "@/lib/supabase/types"

export type { EducationEntry, Activity, ActivityType }

function transformEducation(row: EducationRow): EducationEntry {
  return {
    institution: row.institution,
    degree: row.degree,
    field: row.field,
    startDate: row.start_date,
    endDate: row.end_date,
    description: row.description,
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    gpa: row.gpa ?? undefined,
    courses: Array.isArray(row.courses) ? row.courses : [],
  }
}

function transformActivity(row: ActivityRow): Activity {
  return {
    title: row.title,
    organization: row.organization,
    type: row.type,
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
    description: row.description,
    contributions: Array.isArray(row.contributions) ? row.contributions : [],
    takeaway: row.takeaway ?? undefined,
    image: row.image ?? undefined,
  }
}

export async function getEducation(): Promise<EducationEntry[]> {
  try {
    const supabase = getServerClient()

    const { data, error } = await supabase
      .from("education")
      .select("*")
      .order("sort_order", { ascending: true })

    if (error || !data) return []
    return (data as EducationRow[]).map(transformEducation)
  } catch {
    // fallback
  }

  try {
    const { getEducation: staticGet } = await import("./education-static")
    return staticGet()
  } catch {
    return []
  }
}

export async function getActivities(): Promise<Activity[]> {
  try {
    const supabase = getServerClient()

    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("sort_order", { ascending: true })

    if (error || !data) return []
    return (data as ActivityRow[]).map(transformActivity)
  } catch {
    // fallback
  }

  try {
    const { getActivities: staticGet } = await import("./education-static")
    return staticGet()
  } catch {
    return []
  }
}
