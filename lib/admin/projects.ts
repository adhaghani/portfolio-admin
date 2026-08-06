import { getBrowserClient } from "@/lib/supabase/client"
import type { Json } from "@/lib/supabase/database.types"
import type { ProjectBlock } from "@/lib/supabase/types"

export interface ProjectInsertInput {
  slug: string
  title: string
  tagline?: string
  description?: string
  technologies?: string[]
  year: string
  cover_image?: string | null
  live_url?: string | null
  repo_url?: string | null
  featured?: boolean
  thinking?: ProjectBlock[]
  results?: ProjectBlock[]
}

export interface ProjectUpdateInput extends Partial<ProjectInsertInput> {}

export async function getProjects() {
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data
}

export async function getProject(slug: string) {
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single()
  if (error) throw error
  return data
}

export async function createProject(input: ProjectInsertInput) {
  const { technologies, thinking, results, ...rest } = input
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("projects")
    .insert({
      ...rest,
      technologies: technologies as unknown as Json,
      thinking: thinking as unknown as Json,
      results: results as unknown as Json,
    } as never)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProject(id: string, input: ProjectUpdateInput) {
  const { technologies, thinking, results, ...rest } = input
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("projects")
    .update({
      ...rest,
      technologies: technologies as unknown as Json | undefined,
      thinking: thinking as unknown as Json | undefined,
      results: results as unknown as Json | undefined,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProject(id: string) {
  const supabase = getBrowserClient()
  const { error } = await supabase.from("projects").delete().eq("id", id)
  if (error) throw error
}
