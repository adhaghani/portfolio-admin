"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ChevronLeft, Loader2 } from "lucide-react"
import { activitySchema, type ActivityFormValues } from "@/lib/validations"
import type { ActivityUpdateInput } from "@/lib/admin/activities"
import { getErrorMessage } from "@/lib/error-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MDXEditor } from "@/components/shared/mdx-editor"
import { DynamicListEditor } from "@/components/shared/dynamic-list-editor"
import { ImageUpload } from "@/components/shared/image-upload"

interface ActivityFormProps {
  initialValues?: ActivityUpdateInput | null
  onSubmit: (values: ActivityFormValues) => Promise<void>
  submitLabel: string
  isEditing?: boolean
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

export function ActivityForm({ initialValues, onSubmit, submitLabel, isEditing }: ActivityFormProps) {
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
    try { await onSubmit(values); if (!isEditing) toast.success("Activity created") }
    catch (err) { toast.error(getErrorMessage(err, "Something went wrong")) }
    finally { setSaving(false) }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Sticky action bar */}
      <div className="sticky top-0 z-10 -mx-6 -mt-6 mb-6 flex items-center gap-3 border-b border-border/50 bg-background/95 px-6 py-3 backdrop-blur-sm">
        <Button type="button" variant="ghost" size="sm" onClick={() => router.back()}>
          <ChevronLeft className="mr-1 size-4" /> Back
        </Button>
        <span className="heading-mono text-base">{isEditing ? "Edit activity" : "New activity"}</span>
        <div className="ml-auto">
          <Button type="submit" form="activity-form" size="sm" disabled={saving} className="bg-foreground text-background hover:bg-foreground/90">
            {saving && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </div>

      <form id="activity-form" onSubmit={handleSubmit(handleFormSubmit)} className="max-w-2xl space-y-8">
        <section className="space-y-4 border border-border/50 bg-card p-5">
          <span className="label-mono">Details</span>
          <Separator className="bg-border/50" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><label htmlFor="title" className="label-mono">Title</label><Input id="title" {...register("title")} placeholder="GDSC Core Team" className="input-mono" />{errors.title && <FE msg={errors.title.message} />}</div>
            <div className="space-y-2"><label htmlFor="organization" className="label-mono">Organization</label><Input id="organization" {...register("organization")} placeholder="Google × University" className="input-mono" />{errors.organization && <FE msg={errors.organization.message} />}</div>
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
            <div className="space-y-2"><label htmlFor="sort_order" className="label-mono">Sort order</label><Input type="number" id="sort_order" {...register("sort_order", { valueAsNumber: true })} className="input-mono" /></div>
          </div>
        </section>

        <section className="space-y-4 border border-border/50 bg-card p-5">
          <span className="label-mono">Dates</span>
          <Separator className="bg-border/50" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><label htmlFor="start_date" className="label-mono">Start</label><Input id="start_date" {...register("start_date")} placeholder="2024" className="input-mono" />{errors.start_date && <FE msg={errors.start_date.message} />}</div>
            <div className="space-y-2"><label htmlFor="end_date" className="label-mono">End</label><Input id="end_date" {...register("end_date")} placeholder="Leave blank for present" className="input-mono" /></div>
          </div>
        </section>

        <section className="space-y-4 border border-border/50 bg-card p-5">
          <span className="label-mono">Description</span>
          <Separator className="bg-border/50" />
          <Textarea id="description" {...register("description")} rows={3} placeholder="Short summary of the role..." className="input-mono resize-none" />
        </section>

        <section className="space-y-4 border border-border/50 bg-card p-5">
          <DynamicListEditor value={watch("contributions")} onChange={(items) => setValue("contributions", items)} placeholder="Contribution" label="Contributions" />
        </section>

        <section className="space-y-4 border border-border/50 bg-card p-5">
          <MDXEditor value={watch("takeaway") ?? ""} onChange={(val) => setValue("takeaway", val || null)} minHeight={200} label="Takeaway" />
        </section>

        <section className="space-y-4 border border-border/50 bg-card p-5">
          <span className="label-mono">Image</span>
          <Separator className="bg-border/50" />
          <ImageUpload value={watch("image")} onChange={(url) => setValue("image", url)} path="activities" />
        </section>
      </form>
    </div>
  )
}

function FE({ msg }: { msg?: string }) { return <p className="font-mono text-[11px] text-destructive">{msg}</p> }
