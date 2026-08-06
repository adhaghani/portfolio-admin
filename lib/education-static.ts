// ---------------------------------------------------------------------------
// Static fallback — re-exports from content/education.ts
// Used when Supabase is not configured.
// ---------------------------------------------------------------------------

import {
  activities,
  educationHistory,
  type Activity,
  type ActivityType,
  type EducationEntry,
} from "@/content/education"

export { type Activity, type ActivityType, type EducationEntry }

export function getEducation(): EducationEntry[] {
  return educationHistory
}

export function getActivities(): Activity[] {
  return activities
}
