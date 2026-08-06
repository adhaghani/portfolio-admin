"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { getCertificates, deleteCertificate } from "@/lib/admin/certificates"
import type { CertificateRow } from "@/lib/supabase/types"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"

export default function CertificatesListPage() {
  const router = useRouter()
  const [certificates, setCertificates] = useState<CertificateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<CertificateRow | null>(null)

  const fetch = useCallback(async () => {
    try { setCertificates(await getCertificates()) }
    catch { toast.error("Failed to load certificates") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteCertificate(deleteTarget.id)
      toast.success("Certificate deleted")
      setCertificates((prev) => prev.filter((c) => c.id !== deleteTarget.id))
    } catch { toast.error("Failed to delete certificate") }
    finally { setDeleteTarget(null) }
  }

  if (loading) return null

  return (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="heading-mono">Certificates</h1>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {certificates.length} {certificates.length === 1 ? "certificate" : "certificates"}
          </p>
        </div>
        <Button asChild className="bg-foreground text-background hover:bg-foreground/90">
          <a href="/dashboard/certificates/new">
            <Plus className="mr-1.5 size-4" />
            New certificate
          </a>
        </Button>
      </div>

      {certificates.length === 0 ? (
        <EmptyState title="No certificates yet" description="Add your professional certifications and credentials." actionLabel="New certificate" actionHref="/dashboard/certificates/new" />
      ) : (
        <DataTable
          columns={[
            { key: "title", header: "Title" },
            { key: "issuer", header: "Issuer" },
            { key: "date", header: "Date", render: (c) => {
              const row = c as unknown as CertificateRow
              return new Date(row.date).toLocaleDateString("en-US", { year: "numeric", month: "short" })
            }},
            { key: "url", header: "URL", render: (c) => {
              const row = c as unknown as CertificateRow
              return (
                <a href={row.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                  <ExternalLink className="size-3" />
                  <span className="truncate max-w-[120px]">{row.url}</span>
                </a>
              )
            }},
            { key: "sort_order", header: "Order" },
          ]}
          data={certificates as unknown as Record<string, unknown>[]}
          actions={(c) => {
            const row = c as unknown as CertificateRow
            return (
              <div className="flex items-center justify-end gap-0.5">
                <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/certificates/${row.slug}`)} className="size-8">
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(row)} className="size-8 text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )
          }}
        />
      )}

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete certificate?" description={`"${deleteTarget?.title}" will be permanently deleted.`} onConfirm={handleDelete} />
    </div>
  )
}
