"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ChevronLeft, Loader2 } from "lucide-react"
import {
  blogPostSchema,
  computeReadingTime,
  type BlogPostFormValues,
} from "@/lib/validations"
import type { BlogUpdateInput } from "@/lib/admin/blog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { MDXEditor } from "@/components/shared/mdx-editor"
import { TagInput } from "@/components/shared/tag-input"
import { ImageUpload } from "@/components/shared/image-upload"

interface BlogFormProps {
  initialValues?: BlogUpdateInput | null
  onSubmit: (values: BlogPostFormValues) => Promise<void>
  submitLabel: string
  isEditing?: boolean
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
  isEditing,
}: BlogFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
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
      if (!isEditing) toast.success("Blog post created")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong",
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveDraft() {
    setValue("published", false)
    // trigger form submit manually
    const btn = document.getElementById("blog-form-submit") as HTMLButtonElement
    btn?.click()
  }

  async function handlePublish() {
    setValue("published", true)
    const btn = document.getElementById("blog-form-submit") as HTMLButtonElement
    btn?.click()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Sticky action bar */}
      <div className="sticky top-0 z-10 -mx-6 -mt-6 mb-6 flex items-center gap-3 border-b border-border/50 bg-background/95 px-6 py-3 backdrop-blur-sm">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ChevronLeft className="mr-1 size-4" />
          Back
        </Button>
        <span className="heading-mono text-base">
          {isEditing ? "Edit post" : "New post"}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={saving}
          >
            Save draft
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handlePublish}
            disabled={saving}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            {saving && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            Publish
          </Button>
        </div>
      </div>

      <form
        id="blog-form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex flex-1 flex-col gap-8 lg:flex-row"
      >
        {/* Hidden submit for programmatic trigger */}
        <button id="blog-form-submit" type="submit" className="hidden" />

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="slug" className="label-mono">
                Slug
              </label>
              <Input
                id="slug"
                {...register("slug")}
                placeholder="my-blog-post"
                className="input-mono"
              />
              {errors.slug && <FieldError msg={errors.slug.message} />}
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="label-mono">
                Title
              </label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Post title"
                className="input-mono"
              />
              {errors.title && <FieldError msg={errors.title.message} />}
            </div>
          </div>

          <MDXEditor
            value={content}
            onChange={(val) => setValue("content", val)}
            minHeight={500}
            label="Content"
          />
          {errors.content && <FieldError msg={errors.content.message} />}
        </div>

        {/* Sidebar */}
        <div className="w-full space-y-6 lg:w-72 lg:shrink-0">
          <div className="space-y-4 border border-border/50 bg-card p-5">
            <span className="label-mono">Settings</span>
            <Separator className="bg-border/50" />

            <div className="space-y-2">
              <label htmlFor="date" className="label-mono">
                Date
              </label>
              <Input
                id="date"
                type="date"
                {...register("date")}
                className="input-mono"
              />
              {errors.date && <FieldError msg={errors.date.message} />}
            </div>

            <div className="space-y-2">
              <label className="label-mono">Status</label>
              <div className="flex items-center gap-2 pt-1">
                <Switch
                  id="published"
                  checked={watch("published")}
                  onCheckedChange={(v) => setValue("published", v)}
                />
                <label
                  htmlFor="published"
                  className="font-mono text-xs text-muted-foreground select-none"
                >
                  {watch("published") ? "Published" : "Draft"}
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="label-mono">
                Reading time · {watch("reading_time")} min
              </label>
              <Input
                type="number"
                {...register("reading_time", { valueAsNumber: true })}
                className="input-mono w-20"
              />
            </div>
          </div>

          <div className="space-y-4 border border-border/50 bg-card p-5">
            <span className="label-mono">Metadata</span>
            <Separator className="bg-border/50" />

            <div className="space-y-2">
              <label htmlFor="excerpt" className="label-mono">
                Excerpt
              </label>
              <Textarea
                id="excerpt"
                {...register("excerpt")}
                placeholder="A brief preview of the post..."
                rows={3}
                className="input-mono resize-none"
              />
              {errors.excerpt && <FieldError msg={errors.excerpt.message} />}
            </div>

            <div className="space-y-2">
              <label className="label-mono">Tags</label>
              <TagInput
                value={watch("tags")}
                onChange={(tags) => setValue("tags", tags)}
                placeholder="Add tag..."
              />
            </div>
          </div>

          <div className="space-y-4 border border-border/50 bg-card p-5">
            <span className="label-mono">Cover image</span>
            <Separator className="bg-border/50" />
            <ImageUpload
              value={watch("cover_image")}
              onChange={(url) => setValue("cover_image", url)}
              path="blog"
            />
          </div>
        </div>
      </form>
    </div>
  )
}

function FieldError({ msg }: { msg?: string }) {
  return (
    <p className="font-mono text-[11px] text-destructive">{msg}</p>
  )
}
