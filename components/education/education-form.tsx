"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ChevronLeft, Loader2 } from "lucide-react"
import { educationSchema, type EducationFormValues } from "@/lib/validations"
import type { EducationUpdateInput } from "@/lib/admin/education"
import { getErrorMessage } from "@/lib/error-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { TagInput } from "@/components/shared/tag-input"
import { DynamicListEditor } from "@/components/shared/dynamic-list-editor"

interface EducationFormProps {
  initialValues?: EducationUpdateInput | null
  onSubmit: (values: EducationFormValues) => Promise<void>
  submitLabel: string
  isEditing?: boolean
}

function toDefaults(row: EducationUpdateInput): EducationFormValues {
  return {
    institution: row.institution ?? "",
    degree: row.degree ?? "",
    field: row.field ?? "",
    start_date: row.start_date ?? "",
    end_date: row.end_date ?? "",
    description: row.description ?? "",
    highlights: (row.highlights as string[]) ?? [],
    gpa: row.gpa ?? null,
    courses: (row.courses as string[]) ?? [],
    sort_order: row.sort_order ?? 0,
  }
}

export function EducationForm({ initialValues, onSubmit, submitLabel, isEditing }: EducationFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema) as never,
    defaultValues: initialValues ? toDefaults(initialValues) : {
      institution: "", degree: "", field: "", start_date: "", end_date: "",
      description: "", highlights: [], gpa: null, courses: [], sort_order: 0,
    },
  })

  async function handleFormSubmit(values: EducationFormValues) {
    setSaving(true)
    try {
      await onSubmit(values)
      if (!isEditing) toast.success("Entry created")
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
          {isEditing ? "Edit entry" : "New education entry"}
        </span>
        <div className="ml-auto">
          <Button
            type="submit"
            form="education-form"
            size="sm"
            disabled={saving}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            {saving && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </div>

      <form id="education-form" onSubmit={handleSubmit(handleFormSubmit)} className="max-w-2xl space-y-8">
        {/* Institution details */}
        <section className="space-y-4 border border-border/50 bg-card p-5">
          <span className="label-mono">Institution</span>
          <Separator className="bg-border/50" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="institution" className="label-mono">Institution</label>
              <Input id="institution" {...register("institution")} placeholder="University of Example" className="input-mono" />
              {errors.institution && <FieldError msg={errors.institution.message} />}
            </div>
            <div className="space-y-2">
              <label htmlFor="degree" className="label-mono">Degree</label>
              <Input id="degree" {...register("degree")} placeholder="Bachelor of Science" className="input-mono" />
              {errors.degree && <FieldError msg={errors.degree.message} />}
            </div>
            <div className="space-y-2">
              <label htmlFor="field" className="label-mono">Field of study</label>
              <Input id="field" {...register("field")} placeholder="Computer Science" className="input-mono" />
            </div>
            <div className="space-y-2">
              <label htmlFor="gpa" className="label-mono">GPA</label>
              <Input id="gpa" {...register("gpa")} placeholder="3.87 / 4.0" className="input-mono" />
            </div>
          </div>
        </section>

        {/* Dates */}
        <section className="space-y-4 border border-border/50 bg-card p-5">
          <span className="label-mono">Dates</span>
          <Separator className="bg-border/50" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="start_date" className="label-mono">Start</label>
              <Input id="start_date" {...register("start_date")} placeholder="2022" className="input-mono" />
              {errors.start_date && <FieldError msg={errors.start_date.message} />}
            </div>
            <div className="space-y-2">
              <label htmlFor="end_date" className="label-mono">End</label>
              <Input id="end_date" {...register("end_date")} placeholder="2026" className="input-mono" />
              {errors.end_date && <FieldError msg={errors.end_date.message} />}
            </div>
            <div className="space-y-2">
              <label htmlFor="sort_order" className="label-mono">Sort order</label>
              <Input type="number" id="sort_order" {...register("sort_order", { valueAsNumber: true })} className="input-mono" />
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="space-y-4 border border-border/50 bg-card p-5">
          <span className="label-mono">Description</span>
          <Separator className="bg-border/50" />
          <Textarea id="description" {...register("description")} rows={3} placeholder="What you studied or achieved..." className="input-mono resize-none" />
        </section>

        {/* Highlights */}
        <section className="space-y-4 border border-border/50 bg-card p-5">
          <DynamicListEditor
            value={watch("highlights")}
            onChange={(items) => setValue("highlights", items)}
            placeholder="Achievement or highlight"
            label="Highlights"
          />
        </section>

        {/* Courses */}
        <section className="space-y-4 border border-border/50 bg-card p-5">
          <span className="label-mono">Courses</span>
          <Separator className="bg-border/50" />
          <TagInput value={watch("courses")} onChange={(t) => setValue("courses", t)} placeholder="Add course..." />
        </section>
      </form>
    </div>
  )
}

function FieldError({ msg }: { msg?: string }) {
  return <p className="font-mono text-[11px] text-destructive">{msg}</p>
}
