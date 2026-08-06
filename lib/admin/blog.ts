import { getBrowserClient } from "@/lib/supabase/client"
import type { Json } from "@/lib/supabase/database.types"

export interface BlogInsertInput {
  slug: string
  title: string
  date?: string
  excerpt?: string
  tags?: string[]
  cover_image?: string | null
  content?: string
  reading_time?: number
  published?: boolean
}

export interface BlogUpdateInput extends Partial<BlogInsertInput> {
  updated_at?: string
}

export async function getBlogPosts() {
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("date", { ascending: false })
  if (error) throw error
  return data
}

export async function getBlogPost(slug: string) {
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single()
  if (error) throw error
  return data
}

export async function createBlogPost(input: BlogInsertInput) {
  const { tags, ...rest } = input
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({ ...rest, tags: tags as Json } as never)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateBlogPost(id: string, input: BlogUpdateInput) {
  const { tags, ...rest } = input
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("blog_posts")
    .update({
      ...rest,
      tags: tags as Json | undefined,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBlogPost(id: string) {
  const supabase = getBrowserClient()
  const { error } = await supabase.from("blog_posts").delete().eq("id", id)
  if (error) throw error
}
