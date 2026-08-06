"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { getBlogPost, updateBlogPost, type BlogUpdateInput } from "@/lib/admin/blog"
import { BlogForm } from "@/components/blog/blog-form"
import type { BlogPostFormValues } from "@/lib/validations"

type BlogRow = BlogUpdateInput & { id: string }

export default function EditBlogPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<BlogRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBlogPost(params.slug as string)
      .then((data) => setPost(data as BlogRow))
      .catch(() => { toast.error("Blog post not found"); router.push("/dashboard/blog") })
      .finally(() => setLoading(false))
  }, [params.slug, router])

  async function handleSubmit(values: BlogPostFormValues) {
    if (!post) return
    await updateBlogPost(post.id, values)
  }

  if (loading) return null
  if (!post) return null

  return <BlogForm initialValues={post} onSubmit={handleSubmit} submitLabel="Save changes" />
}
