import { getBrowserClient } from "@/lib/supabase/client"
import type { Json } from "@/lib/supabase/database.types"

export interface EducationInsertInput {
  institution: string
  degree: string
  field?: string
  start_date: string
  end_date: string
  description?: string
  highlights?: string[]
  gpa?: string | null
  courses?: string[]
  sort_order?: number
}

export interface EducationUpdateInput extends Partial<EducationInsertInput> {}

export async function getEducationEntries() {
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("education")
    .select("*")
    .order("sort_order", { ascending: true })
  if (error) throw error
  return data
}

export async function getEducationEntry(id: string) {
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("education")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw error
  return data
}

export async function createEducationEntry(input: EducationInsertInput) {
  const { highlights, courses, ...rest } = input
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("education")
    .insert({ ...rest, highlights: highlights as Json, courses: courses as Json } as never)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateEducationEntry(id: string, input: EducationUpdateInput) {
  const { highlights, courses, ...rest } = input
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("education")
    .update({ ...rest, highlights: highlights as Json | undefined, courses: courses as Json | undefined } as never)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteEducationEntry(id: string) {
  const supabase = getBrowserClient()
  const { error } = await supabase.from("education").delete().eq("id", id)
  if (error) throw error
}
