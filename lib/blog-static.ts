// ---------------------------------------------------------------------------
// Static fallback — reads MDX files from content/blog/
// Used when Supabase is not configured (build time or local dev without keys)
// ---------------------------------------------------------------------------

import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { getReadingTime } from "@/lib/reading-time"
import type { BlogPost } from "@/lib/supabase/types"

const BLOG_DIR = path.join(process.cwd(), "content", "blog")

export function getBlogPost(slug: string): BlogPost | undefined {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return undefined

  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)

  return {
    slug,
    title: (data.title as string) ?? slug,
    date: (data.date as string) ?? "",
    excerpt: (data.excerpt as string) ?? "",
    tags: (data.tags as string[]) ?? [],
    coverImage: data.coverImage as string | undefined,
    readingTime: getReadingTime(content),
    content,
  }
}

export function getBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return []

  const files = fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith(".mdx"))

  return files
    .map((file) => getBlogPost(file.replace(/\.mdx$/, "")))
    .filter((post): post is BlogPost => Boolean(post))
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
}

export function getBlogSlugs(): string[] {
  return getBlogPosts().map((post) => post.slug)
}
