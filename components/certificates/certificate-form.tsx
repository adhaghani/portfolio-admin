"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { certificateSchema, type CertificateFormValues } from "@/lib/validations"
import type { CertificateUpdateInput } from "@/lib/admin/certificates"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface CertificateFormProps {
  initialValues?: CertificateUpdateInput | null
  onSubmit: (values: CertificateFormValues) => Promise<void>
  submitLabel: string
}

function getToday(): string { return new Date().toISOString().split("T")[0] }

function toDefaults(row: CertificateUpdateInput): CertificateFormValues {
  return {
    slug: row.slug ?? "", title: row.title ?? "", issuer: row.issuer ?? "",
    date: row.date ?? getToday(), description: row.description ?? null,
    url: row.url ?? "", credential_id: row.credential_id ?? null, sort_order: row.sort_order ?? 0,
  }
}

export function CertificateForm({ initialValues, onSubmit, submitLabel }: CertificateFormProps) {
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
    try { await onSubmit(values) }
    catch (err) { toast.error(err instanceof Error ? err.message : "Something went wrong") }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="max-w-xl space-y-6">
      <h1 className="heading-mono">{initialValues ? "Edit certificate" : "New certificate"}</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2"><label htmlFor="slug" className="label-mono">Slug</label><Input id="slug" {...register("slug")} className="input-mono" />{errors.slug && <FE msg={errors.slug.message} />}</div>
        <div className="space-y-2"><label htmlFor="title" className="label-mono">Title</label><Input id="title" {...register("title")} className="input-mono" />{errors.title && <FE msg={errors.title.message} />}</div>
        <div className="space-y-2"><label htmlFor="issuer" className="label-mono">Issuer</label><Input id="issuer" {...register("issuer")} className="input-mono" />{errors.issuer && <FE msg={errors.issuer.message} />}</div>
        <div className="space-y-2"><label htmlFor="date" className="label-mono">Date</label><Input type="date" id="date" {...register("date")} className="input-mono" />{errors.date && <FE msg={errors.date.message} />}</div>
        <div className="space-y-2"><label htmlFor="credential_id" className="label-mono">Credential ID</label><Input id="credential_id" {...register("credential_id")} className="input-mono" /></div>
        <div className="space-y-2"><label htmlFor="sort_order" className="label-mono">Sort order</label><Input type="number" id="sort_order" {...register("sort_order", { valueAsNumber: true })} className="input-mono w-24" /></div>
      </div>
      <div className="space-y-2"><label htmlFor="description" className="label-mono">Description</label><Textarea id="description" {...register("description")} rows={3} className="font-mono text-sm" /></div>
      <div className="space-y-2"><label htmlFor="url" className="label-mono">Verification URL</label><Input id="url" {...register("url")} placeholder="https://..." className="input-mono" />{errors.url && <FE msg={errors.url.message} />}</div>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving} className="bg-foreground text-background hover:bg-foreground/90">{saving ? "Saving..." : submitLabel}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}

function FE({ msg }: { msg?: string }) { return <p className="font-mono text-xs text-destructive">{msg}</p> }
