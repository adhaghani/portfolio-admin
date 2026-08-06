"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { projectSchema, type ProjectFormValues } from "@/lib/validations"
import type { ProjectUpdateInput } from "@/lib/admin/projects"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { MDXEditor } from "@/components/shared/mdx-editor"
import { TagInput } from "@/components/shared/tag-input"
import { ImageUpload } from "@/components/shared/image-upload"
import { ThinkingResultsEditor } from "@/components/projects/thinking-results-editor"

interface ProjectFormProps {
  initialValues?: ProjectUpdateInput | null
  onSubmit: (values: ProjectFormValues) => Promise<void>
  submitLabel: string
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6 lg:flex-row">
      <div className="min-w-0 flex-1 space-y-6">
        <div className="space-y-2">
          <label htmlFor="slug" className="label-mono">Slug</label>
          <Input id="slug" {...register("slug")} placeholder="my-project" className="input-mono" />
          {errors.slug && <FE msg={errors.slug.message} />}
        </div>
        <div className="space-y-2">
          <label htmlFor="title" className="label-mono">Title</label>
          <Input id="title" {...register("title")} placeholder="Project title" className="input-mono" />
          {errors.title && <FE msg={errors.title.message} />}
        </div>
        <div className="space-y-2">
          <label htmlFor="tagline" className="label-mono">Tagline</label>
          <Input id="tagline" {...register("tagline")} placeholder="One-liner subtitle" className="input-mono" />
          {errors.tagline && <FE msg={errors.tagline.message} />}
        </div>
        <MDXEditor value={watch("description")} onChange={(val) => setValue("description", val)} minHeight={300} label="Description (MDX)" />
        {errors.description && <FE msg={errors.description.message} />}
        <ThinkingResultsEditor value={watch("thinking")} onChange={(b) => setValue("thinking", b)} label="Thinking" />
        <ThinkingResultsEditor value={watch("results")} onChange={(b) => setValue("results", b)} label="Results" />
      </div>

      <div className="w-full space-y-6 lg:w-72 lg:shrink-0">
        <div className="space-y-4 border border-border/50 bg-card p-4">
          <div className="space-y-2">
            <label className="label-mono">Technologies</label>
            <TagInput value={watch("technologies")} onChange={(t) => setValue("technologies", t)} placeholder="Add technology..." />
          </div>
          <div className="space-y-2">
            <label htmlFor="year" className="label-mono">Year</label>
            <Input id="year" {...register("year")} placeholder="2025" className="input-mono" />
            {errors.year && <FE msg={errors.year.message} />}
          </div>
          <div className="space-y-2">
            <label htmlFor="live_url" className="label-mono">Live URL</label>
            <Input id="live_url" {...register("live_url")} placeholder="https://..." className="input-mono" />
          </div>
          <div className="space-y-2">
            <label htmlFor="repo_url" className="label-mono">Repo URL</label>
            <Input id="repo_url" {...register("repo_url")} placeholder="https://github.com/..." className="input-mono" />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="featured" className="label-mono">Featured</label>
            <Switch id="featured" checked={watch("featured")} onCheckedChange={(v) => setValue("featured", v)} />
          </div>
        </div>
        <ImageUpload value={watch("cover_image")} onChange={(url) => setValue("cover_image", url)} path="projects" label="Cover image" />
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

function FE({ msg }: { msg?: string }) {
  return <p className="font-mono text-xs text-destructive">{msg}</p>
}
