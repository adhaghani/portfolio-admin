// ---------------------------------------------------------------------------
// Static fallback — re-exports from content/projects.ts
// Used when Supabase is not configured.
// ---------------------------------------------------------------------------

import {
  projects,
  type Project,
} from "@/content/projects"

export { type Project }

export function getProjects(): Project[] {
  return projects
}

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug)
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((project) => project.featured)
}
