// ---------------------------------------------------------------------------
// Blog data layer — Supabase-first with static fallback for builds
// ---------------------------------------------------------------------------

import { getServerClient } from "@/lib/supabase/server"
import { getReadingTime } from "@/lib/reading-time"
import type { BlogPost } from "@/lib/supabase/types"
import type { BlogRow } from "@/lib/supabase/types"

// Re-export the type for backward compatibility
export type { BlogPost }

function transformRow(row: BlogRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    date: row.date,
    excerpt: row.excerpt,
    tags: Array.isArray(row.tags) ? row.tags : [],
    coverImage: row.cover_image ?? undefined,
    readingTime: row.reading_time,
    content: row.content,
  }
}

/**
 * Fetch a single published blog post by slug.
 * Returns undefined when Supabase isn't configured or the row is missing.
 */
export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  try {
    const supabase = getServerClient()

    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single()

    if (error || !data) return undefined
    return transformRow(data as BlogRow)
  } catch {
    // Supabase not configured — fall through
  }

  // --- static fallback during build / when Supabase isn't set up ---
  try {
    const { getBlogPost: staticGet } = await import("./blog-static")
    return staticGet(slug)
  } catch {
    return undefined
  }
}

/**
 * Fetch all published blog posts, newest first.
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const supabase = getServerClient()

    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("date", { ascending: false })

    if (error || !data) return []
    return (data as BlogRow[]).map(transformRow)
  } catch {
    // Supabase not configured — fall through
  }

  try {
    const { getBlogPosts: staticGet } = await import("./blog-static")
    return staticGet()
  } catch {
    return []
  }
}

/**
 * Fetch all blog slugs (for static generation).
 */
export async function getBlogSlugs(): Promise<string[]> {
  try {
    const supabase = getServerClient()

    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("published", true)

    if (error || !data) return []
    return data.map((row: { slug: string }) => row.slug)
  } catch {
    // fallback
  }

  try {
    const { getBlogSlugs: staticGet } = await import("./blog-static")
    return staticGet()
  } catch {
    return []
  }
}
