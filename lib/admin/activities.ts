import { getBrowserClient } from "@/lib/supabase/client"
import type { Json } from "@/lib/supabase/database.types"
import type { ActivityType } from "@/lib/supabase/types"

export interface ActivityInsertInput {
  title: string
  organization: string
  type: ActivityType
  start_date: string
  end_date?: string | null
  description?: string
  contributions?: string[]
  takeaway?: string | null
  image?: string | null
  sort_order?: number
}

export interface ActivityUpdateInput extends Partial<ActivityInsertInput> {}

export async function getActivities() {
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("sort_order", { ascending: true })
  if (error) throw error
  return data
}

export async function getActivity(id: string) {
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw error
  return data
}

export async function createActivity(input: ActivityInsertInput) {
  const { contributions, ...rest } = input
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("activities")
    .insert({ ...rest, contributions: contributions as Json } as never)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateActivity(id: string, input: ActivityUpdateInput) {
  const { contributions, ...rest } = input
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("activities")
    .update({ ...rest, contributions: contributions as Json | undefined } as never)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteActivity(id: string) {
  const supabase = getBrowserClient()
  const { error } = await supabase.from("activities").delete().eq("id", id)
  if (error) throw error
}
