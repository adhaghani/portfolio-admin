"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  blogPostSchema,
  computeReadingTime,
  type BlogPostFormValues,
} from "@/lib/validations"
import type { BlogRow } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { MDXEditor } from "@/components/shared/mdx-editor"
import { TagInput } from "@/components/shared/tag-input"
import { ImageUpload } from "@/components/shared/image-upload"
import type { BlogUpdateInput } from "@/lib/admin/blog"

interface BlogFormProps {
  initialValues?: BlogUpdateInput | null
  initialId?: string
  onSubmit: (values: BlogPostFormValues) => Promise<void>
  submitLabel: string
}

function getToday(): string {
  return new Date().toISOString().split("T")[0]
}

function blogRowToDefaults(row: BlogUpdateInput): BlogPostFormValues {
  return {
    slug: row.slug ?? "",
    title: row.title ?? "",
    date: row.date ?? getToday(),
    excerpt: row.excerpt ?? "",
    tags: (row.tags as string[]) ?? [],
    cover_image: row.cover_image ?? null,
    content: row.content ?? "",
    reading_time: row.reading_time ?? 1,
    published: row.published ?? false,
  }
}

export function BlogForm({
  initialValues,
  onSubmit,
  submitLabel,
}: BlogFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema) as never,
    defaultValues: initialValues
      ? blogRowToDefaults(initialValues)
      : {
          slug: "",
          title: "",
          date: getToday(),
          excerpt: "",
          tags: [],
          cover_image: null,
          content: "",
          reading_time: 1,
          published: false,
        },
  })

  const content = watch("content")

  useEffect(() => {
    setValue("reading_time", computeReadingTime(content))
  }, [content, setValue])

  async function handleFormSubmit(values: BlogPostFormValues) {
    setSaving(true)
    try {
      await onSubmit(values)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong",
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-6 lg:flex-row"
    >
      {/* Main content area */}
      <div className="min-w-0 flex-1 space-y-6">
        <div className="space-y-2">
          <label htmlFor="slug" className="label-mono">Slug</label>
          <Input id="slug" {...register("slug")} placeholder="my-blog-post" className="input-mono" />
          {errors.slug && <FieldError msg={errors.slug.message} />}
        </div>
        <div className="space-y-2">
          <label htmlFor="title" className="label-mono">Title</label>
          <Input id="title" {...register("title")} placeholder="Post title" className="input-mono" />
          {errors.title && <FieldError msg={errors.title.message} />}
        </div>
        <MDXEditor value={content} onChange={(val) => setValue("content", val)} minHeight={400} label="Content (MDX)" />
        {errors.content && <FieldError msg={errors.content.message} />}
      </div>

      {/* Sidebar */}
      <div className="w-full space-y-6 lg:w-72 lg:shrink-0">
        <div className="space-y-4 border border-border/50 bg-card p-4">
          <div className="space-y-2">
            <label htmlFor="date" className="label-mono">Date</label>
            <Input id="date" type="date" {...register("date")} className="input-mono" />
            {errors.date && <FieldError msg={errors.date.message} />}
          </div>
          <div className="space-y-2">
            <label htmlFor="excerpt" className="label-mono">Excerpt</label>
            <Textarea id="excerpt" {...register("excerpt")} placeholder="Brief preview..." rows={2} className="font-mono text-sm" />
            {errors.excerpt && <FieldError msg={errors.excerpt.message} />}
          </div>
          <div className="space-y-2">
            <label className="label-mono">Tags</label>
            <TagInput value={watch("tags")} onChange={(tags) => setValue("tags", tags)} placeholder="Add tag..." />
          </div>
          <div className="space-y-2">
            <label className="label-mono">Reading time (min)</label>
            <Input type="number" {...register("reading_time", { valueAsNumber: true })} className="input-mono w-20" />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="published" className="label-mono">Published</label>
            <Switch id="published" checked={watch("published")} onCheckedChange={(v) => setValue("published", v)} />
          </div>
        </div>
        <ImageUpload value={watch("cover_image")} onChange={(url) => setValue("cover_image", url)} path="blog" label="Cover image" />
        <div className="flex gap-2">
          <Button type="submit" disabled={saving} className="flex-1 bg-foreground text-background hover:bg-foreground/90">
            {saving ? "Saving..." : submitLabel}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </div>
    </form>
  )
}

function FieldError({ msg }: { msg?: string }) {
  return <p className="font-mono text-xs text-destructive">{msg}</p>
}
