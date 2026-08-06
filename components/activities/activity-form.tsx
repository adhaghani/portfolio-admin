"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { activitySchema, type ActivityFormValues } from "@/lib/validations"
import type { ActivityUpdateInput } from "@/lib/admin/activities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MDXEditor } from "@/components/shared/mdx-editor"
import { DynamicListEditor } from "@/components/shared/dynamic-list-editor"
import { ImageUpload } from "@/components/shared/image-upload"

interface ActivityFormProps {
  initialValues?: ActivityUpdateInput | null
  onSubmit: (values: ActivityFormValues) => Promise<void>
  submitLabel: string
}

function toDefaults(row: ActivityUpdateInput): ActivityFormValues {
  return {
    title: row.title ?? "",
    organization: row.organization ?? "",
    type: (row.type as ActivityFormValues["type"]) ?? "involvement",
    start_date: row.start_date ?? "",
    end_date: row.end_date ?? null,
    description: row.description ?? "",
    contributions: (row.contributions as string[]) ?? [],
    takeaway: row.takeaway ?? null,
    image: row.image ?? null,
    sort_order: row.sort_order ?? 0,
  }
}

export function ActivityForm({ initialValues, onSubmit, submitLabel }: ActivityFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema) as never,
    defaultValues: initialValues ? toDefaults(initialValues) : {
      title: "", organization: "", type: "involvement", start_date: "", end_date: null,
      description: "", contributions: [], takeaway: null, image: null, sort_order: 0,
    },
  })

  async function handleFormSubmit(values: ActivityFormValues) {
    setSaving(true)
    try { await onSubmit(values) }
    catch (err) { toast.error(err instanceof Error ? err.message : "Something went wrong") }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="max-w-xl space-y-6">
      <h1 className="heading-mono">{initialValues ? "Edit activity" : "New activity"}</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2"><label htmlFor="title" className="label-mono">Title</label><Input id="title" {...register("title")} className="input-mono" />{errors.title && <FE msg={errors.title.message} />}</div>
        <div className="space-y-2"><label htmlFor="organization" className="label-mono">Organization</label><Input id="organization" {...register("organization")} className="input-mono" />{errors.organization && <FE msg={errors.organization.message} />}</div>
        <div className="space-y-2">
          <label className="label-mono">Type</label>
          <Select value={watch("type")} onValueChange={(v) => setValue("type", v as ActivityFormValues["type"])}>
            <SelectTrigger className="input-mono"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="program">Program</SelectItem>
              <SelectItem value="ambassadorship">Ambassadorship</SelectItem>
              <SelectItem value="involvement">Involvement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><label htmlFor="sort_order" className="label-mono">Sort order</label><Input type="number" id="sort_order" {...register("sort_order", { valueAsNumber: true })} className="input-mono w-24" /></div>
        <div className="space-y-2"><label htmlFor="start_date" className="label-mono">Start date</label><Input id="start_date" {...register("start_date")} placeholder="2024" className="input-mono" />{errors.start_date && <FE msg={errors.start_date.message} />}</div>
        <div className="space-y-2"><label htmlFor="end_date" className="label-mono">End date</label><Input id="end_date" {...register("end_date")} placeholder="Leave blank for present" className="input-mono" /></div>
      </div>
      <div className="space-y-2"><label htmlFor="description" className="label-mono">Description</label><Textarea id="description" {...register("description")} rows={3} className="font-mono text-sm" /></div>
      <DynamicListEditor value={watch("contributions")} onChange={(items) => setValue("contributions", items)} placeholder="Contribution" label="Contributions" />
      <MDXEditor value={watch("takeaway") ?? ""} onChange={(val) => setValue("takeaway", val || null)} minHeight={200} label="Takeaway (MDX)" />
      <ImageUpload value={watch("image")} onChange={(url) => setValue("image", url)} path="activities" label="Image" />
      <div className="flex gap-2">
        <Button type="submit" disabled={saving} className="bg-foreground text-background hover:bg-foreground/90">{saving ? "Saving..." : submitLabel}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}

function FE({ msg }: { msg?: string }) { return <p className="font-mono text-xs text-destructive">{msg}</p> }
