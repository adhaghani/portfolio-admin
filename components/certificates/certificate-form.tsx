"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ChevronLeft, Loader2 } from "lucide-react"
import { certificateSchema, type CertificateFormValues } from "@/lib/validations"
import type { CertificateUpdateInput } from "@/lib/admin/certificates"
import { getErrorMessage } from "@/lib/error-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

interface CertificateFormProps {
  initialValues?: CertificateUpdateInput | null
  onSubmit: (values: CertificateFormValues) => Promise<void>
  submitLabel: string
  isEditing?: boolean
}

function getToday(): string { return new Date().toISOString().split("T")[0] }

function toDefaults(row: CertificateUpdateInput): CertificateFormValues {
  return {
    slug: row.slug ?? "", title: row.title ?? "", issuer: row.issuer ?? "",
    date: row.date ?? getToday(), description: row.description ?? null,
    url: row.url ?? "", credential_id: row.credential_id ?? null, sort_order: row.sort_order ?? 0,
  }
}

export function CertificateForm({ initialValues, onSubmit, submitLabel, isEditing }: CertificateFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema) as never,
    defaultValues: initialValues ? toDefaults(initialValues) : {
      slug: "", title: "", issuer: "", date: getToday(), description: null, url: "", credential_id: null, sort_order: 0,
    },
  })

  async function handleFormSubmit(values: CertificateFormValues) {
    setSaving(true)
    try { await onSubmit(values); if (!isEditing) toast.success("Certificate created") }
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
        <span className="heading-mono text-base">{isEditing ? "Edit certificate" : "New certificate"}</span>
        <div className="ml-auto">
          <Button type="submit" form="cert-form" size="sm" disabled={saving} className="bg-foreground text-background hover:bg-foreground/90">
            {saving && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </div>

      <form id="cert-form" onSubmit={handleSubmit(handleFormSubmit)} className="max-w-2xl space-y-8">
        <section className="space-y-4 border border-border/50 bg-card p-5">
          <span className="label-mono">Details</span>
          <Separator className="bg-border/50" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><label htmlFor="slug" className="label-mono">Slug</label><Input id="slug" {...register("slug")} placeholder="my-certificate" className="input-mono" />{errors.slug && <FE msg={errors.slug.message} />}</div>
            <div className="space-y-2"><label htmlFor="title" className="label-mono">Title</label><Input id="title" {...register("title")} placeholder="Cloud Digital Leader" className="input-mono" />{errors.title && <FE msg={errors.title.message} />}</div>
            <div className="space-y-2"><label htmlFor="issuer" className="label-mono">Issuer</label><Input id="issuer" {...register("issuer")} placeholder="Google Cloud" className="input-mono" />{errors.issuer && <FE msg={errors.issuer.message} />}</div>
            <div className="space-y-2"><label htmlFor="date" className="label-mono">Date</label><Input type="date" id="date" {...register("date")} className="input-mono" />{errors.date && <FE msg={errors.date.message} />}</div>
          </div>
        </section>

        <section className="space-y-4 border border-border/50 bg-card p-5">
          <span className="label-mono">Links</span>
          <Separator className="bg-border/50" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><label htmlFor="credential_id" className="label-mono">Credential ID</label><Input id="credential_id" {...register("credential_id")} placeholder="GCL-2025-0001" className="input-mono" /></div>
            <div className="space-y-2"><label htmlFor="sort_order" className="label-mono">Sort order</label><Input type="number" id="sort_order" {...register("sort_order", { valueAsNumber: true })} className="input-mono" /></div>
          </div>
          <div className="space-y-2">
            <label htmlFor="url" className="label-mono">Verification URL</label>
            <Input id="url" {...register("url")} placeholder="https://..." className="input-mono" />
            {errors.url && <FE msg={errors.url.message} />}
          </div>
        </section>

        <section className="space-y-4 border border-border/50 bg-card p-5">
          <span className="label-mono">Description</span>
          <Separator className="bg-border/50" />
          <Textarea id="description" {...register("description")} rows={3} placeholder="What this certification covers..." className="input-mono resize-none" />
        </section>
      </form>
    </div>
  )
}

function FE({ msg }: { msg?: string }) { return <p className="font-mono text-[11px] text-destructive">{msg}</p> }
