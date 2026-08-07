"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createBlogPost } from "@/lib/admin/blog"
import { BlogForm } from "@/components/blog/blog-form"
import { getErrorMessage } from "@/lib/error-utils"
import type { BlogPostFormValues } from "@/lib/validations"

export default function NewBlogPage() {
  const router = useRouter()

  async function handleSubmit(values: BlogPostFormValues) {
    try {
      await createBlogPost(values)
      toast.success("Blog post created")
      router.push("/dashboard/blog")
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create blog post"))
    }
  }

  return <BlogForm onSubmit={handleSubmit} submitLabel="Create post" />
}
