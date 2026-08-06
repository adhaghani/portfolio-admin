// ---------------------------------------------------------------------------
// Projects data layer — Supabase-first with static fallback
// ---------------------------------------------------------------------------

import { getServerClient } from "@/lib/supabase/server"
import type { Project, ProjectBlock } from "@/lib/supabase/types"
import type { ProjectRow } from "@/lib/supabase/types"

export type { Project, ProjectBlock }

function transformRow(row: ProjectRow): Project {
  return {
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    description: row.description,
    technologies: Array.isArray(row.technologies) ? row.technologies : [],
    year: row.year,
    coverImage: row.cover_image ?? undefined,
    liveUrl: row.live_url ?? undefined,
    repoUrl: row.repo_url ?? undefined,
    featured: row.featured,
    thinking: Array.isArray(row.thinking)
      ? (row.thinking as ProjectBlock[])
      : [],
    results: Array.isArray(row.results)
      ? (row.results as ProjectBlock[])
      : [],
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const supabase = getServerClient()

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("year", { ascending: false })

    if (error || !data) return []
    return (data as ProjectRow[]).map(transformRow)
  } catch {
    // fallback
  }

  try {
    const { getProjects: staticGet } = await import("./projects-static")
    return staticGet()
  } catch {
    return []
  }
}

export async function getProject(slug: string): Promise<Project | undefined> {
  try {
    const supabase = getServerClient()

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .single()

    if (error || !data) return undefined
    return transformRow(data as ProjectRow)
  } catch {
    // fallback
  }

  try {
    const { getProject: staticGet } = await import("./projects-static")
    return staticGet(slug)
  } catch {
    return undefined
  }
}

export async function getFeaturedProjects(): Promise<Project[]> {
  try {
    const supabase = getServerClient()

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("featured", true)
      .order("year", { ascending: false })

    if (error || !data) return []
    return (data as ProjectRow[]).map(transformRow)
  } catch {
    // fallback
  }

  try {
    const { getFeaturedProjects: staticGet } =
      await import("./projects-static")
    return staticGet()
  } catch {
    return []
  }
}
