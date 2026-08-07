"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ChevronLeft, Loader2 } from "lucide-react"
import { projectSchema, type ProjectFormValues } from "@/lib/validations"
import type { ProjectUpdateInput } from "@/lib/admin/projects"
import { getErrorMessage } from "@/lib/error-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { MDXEditor } from "@/components/shared/mdx-editor"
import { TagInput } from "@/components/shared/tag-input"
import { ImageUpload } from "@/components/shared/image-upload"
import { ThinkingResultsEditor } from "@/components/projects/thinking-results-editor"

interface ProjectFormProps {
  initialValues?: ProjectUpdateInput | null
  onSubmit: (values: ProjectFormValues) => Promise<void>
  submitLabel: string
  isEditing?: boolean
}

function toDefaults(row: ProjectUpdateInput): ProjectFormValues {
  return {
    slug: row.slug ?? "",
    title: row.title ?? "",
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    technologies: (row.technologies as string[]) ?? [],
    year: row.year ?? String(new Date().getFullYear()),
    cover_image: row.cover_image ?? null,
    live_url: row.live_url ?? "",
    repo_url: row.repo_url ?? "",
    featured: row.featured ?? false,
    thinking: (row.thinking as never[]) ?? [],
    results: (row.results as never[]) ?? [],
  }
}

export function ProjectForm({
  initialValues,
  onSubmit,
  submitLabel,
  isEditing,
}: ProjectFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as never,
    defaultValues: initialValues
      ? toDefaults(initialValues)
      : {
          slug: "",
          title: "",
          tagline: "",
          description: "",
          technologies: [],
          year: String(new Date().getFullYear()),
          cover_image: null,
          live_url: "",
          repo_url: "",
          featured: false,
          thinking: [],
          results: [],
        },
  })

  async function handleFormSubmit(values: ProjectFormValues) {
    setSaving(true)
    try {
      await onSubmit(values)
      if (!isEditing) toast.success("Project created")
    } catch (err) {
      toast.error(getErrorMessage(err, "Something went wrong"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Sticky action bar */}
      <div className="sticky top-0 z-10 -mx-6 -mt-6 mb-6 flex items-center gap-3 border-b border-border/50 bg-background/95 px-6 py-3 backdrop-blur-sm">
        <Button type="button" variant="ghost" size="sm" onClick={() => router.back()}>
          <ChevronLeft className="mr-1 size-4" />
          Back
        </Button>
        <span className="heading-mono text-base">
          {isEditing ? "Edit project" : "New project"}
        </span>
        <div className="ml-auto">
          <Button
            type="submit"
            form="project-form"
            size="sm"
            disabled={saving}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            {saving && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </div>

      <form
        id="project-form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex flex-1 flex-col gap-8 lg:flex-row"
      >
        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="slug" className="label-mono">Slug</label>
              <Input id="slug" {...register("slug")} placeholder="my-project" className="input-mono" />
              {errors.slug && <FieldError msg={errors.slug.message} />}
            </div>
            <div className="space-y-2">
              <label htmlFor="title" className="label-mono">Title</label>
              <Input id="title" {...register("title")} placeholder="Project title" className="input-mono" />
              {errors.title && <FieldError msg={errors.title.message} />}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="tagline" className="label-mono">Tagline</label>
            <Input id="tagline" {...register("tagline")} placeholder="One-liner subtitle" className="input-mono" />
            {errors.tagline && <FieldError msg={errors.tagline.message} />}
          </div>

          <MDXEditor
            value={watch("description")}
            onChange={(val) => setValue("description", val)}
            minHeight={300}
            label="Description"
          />
          {errors.description && <FieldError msg={errors.description.message} />}

          <Separator className="bg-border/50" />

          <ThinkingResultsEditor
            value={watch("thinking")}
            onChange={(b) => setValue("thinking", b)}
            label="Thinking"
          />

          <ThinkingResultsEditor
            value={watch("results")}
            onChange={(b) => setValue("results", b)}
            label="Results"
          />
        </div>

        {/* Sidebar */}
        <div className="w-full space-y-6 lg:w-72 lg:shrink-0">
          <div className="space-y-4 border border-border/50 bg-card p-5">
            <span className="label-mono">Settings</span>
            <Separator className="bg-border/50" />

            <div className="space-y-2">
              <label className="label-mono">Technologies</label>
              <TagInput
                value={watch("technologies")}
                onChange={(t) => setValue("technologies", t)}
                placeholder="Add technology..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="year" className="label-mono">Year</label>
              <Input id="year" {...register("year")} placeholder="2025" className="input-mono" />
              {errors.year && <FieldError msg={errors.year.message} />}
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="featured" className="label-mono">Featured</label>
              <Switch id="featured" checked={watch("featured")} onCheckedChange={(v) => setValue("featured", v)} />
            </div>
          </div>

          <div className="space-y-4 border border-border/50 bg-card p-5">
            <span className="label-mono">Links</span>
            <Separator className="bg-border/50" />

            <div className="space-y-2">
              <label htmlFor="live_url" className="label-mono">Live URL</label>
              <Input id="live_url" {...register("live_url")} placeholder="https://..." className="input-mono" />
            </div>
            <div className="space-y-2">
              <label htmlFor="repo_url" className="label-mono">Repo URL</label>
              <Input id="repo_url" {...register("repo_url")} placeholder="https://github.com/..." className="input-mono" />
            </div>
          </div>

          <div className="space-y-4 border border-border/50 bg-card p-5">
            <span className="label-mono">Cover image</span>
            <Separator className="bg-border/50" />
            <ImageUpload
              value={watch("cover_image")}
              onChange={(url) => setValue("cover_image", url)}
              path="projects"
            />
          </div>
        </div>
      </form>
    </div>
  )
}

function FieldError({ msg }: { msg?: string }) {
  return <p className="font-mono text-[11px] text-destructive">{msg}</p>
}
