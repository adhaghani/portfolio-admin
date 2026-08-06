"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { educationSchema, type EducationFormValues } from "@/lib/validations"
import type { EducationUpdateInput } from "@/lib/admin/education"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TagInput } from "@/components/shared/tag-input"
import { DynamicListEditor } from "@/components/shared/dynamic-list-editor"

interface EducationFormProps {
  initialValues?: EducationUpdateInput | null
  onSubmit: (values: EducationFormValues) => Promise<void>
  submitLabel: string
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

export function EducationForm({ initialValues, onSubmit, submitLabel }: EducationFormProps) {
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
    try { await onSubmit(values) }
    catch (err) { toast.error(err instanceof Error ? err.message : "Something went wrong") }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="max-w-xl space-y-6">
      <h1 className="heading-mono">{initialValues ? "Edit entry" : "New education entry"}</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2"><label htmlFor="institution" className="label-mono">Institution</label><Input id="institution" {...register("institution")} className="input-mono" />{errors.institution && <FE msg={errors.institution.message} />}</div>
        <div className="space-y-2"><label htmlFor="degree" className="label-mono">Degree</label><Input id="degree" {...register("degree")} className="input-mono" />{errors.degree && <FE msg={errors.degree.message} />}</div>
        <div className="space-y-2"><label htmlFor="field" className="label-mono">Field</label><Input id="field" {...register("field")} className="input-mono" /></div>
        <div className="space-y-2"><label htmlFor="gpa" className="label-mono">GPA</label><Input id="gpa" {...register("gpa")} className="input-mono" /></div>
        <div className="space-y-2"><label htmlFor="start_date" className="label-mono">Start date</label><Input id="start_date" {...register("start_date")} placeholder="2022" className="input-mono" />{errors.start_date && <FE msg={errors.start_date.message} />}</div>
        <div className="space-y-2"><label htmlFor="end_date" className="label-mono">End date</label><Input id="end_date" {...register("end_date")} placeholder="2026" className="input-mono" />{errors.end_date && <FE msg={errors.end_date.message} />}</div>
      </div>
      <div className="space-y-2"><label htmlFor="description" className="label-mono">Description</label><Textarea id="description" {...register("description")} rows={3} className="font-mono text-sm" /></div>
      <DynamicListEditor value={watch("highlights")} onChange={(items) => setValue("highlights", items)} placeholder="Highlight" label="Highlights" />
      <div className="space-y-2"><label className="label-mono">Courses</label><TagInput value={watch("courses")} onChange={(t) => setValue("courses", t)} placeholder="Add course..." /></div>
      <div className="space-y-2"><label htmlFor="sort_order" className="label-mono">Sort order</label><Input type="number" id="sort_order" {...register("sort_order", { valueAsNumber: true })} className="input-mono w-24" /></div>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving} className="bg-foreground text-background hover:bg-foreground/90">{saving ? "Saving..." : submitLabel}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}

function FE({ msg }: { msg?: string }) { return <p className="font-mono text-xs text-destructive">{msg}</p> }
