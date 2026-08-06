"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { ExternalLink, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  getCertificates,
  deleteCertificate,
} from "@/lib/admin/certificates"
import type { CertificateRow } from "@/lib/supabase/types"
import { PageHeader } from "@/components/shared/page-header"
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
    try {
      setCertificates(await getCertificates())
    } catch {
      toast.error("Failed to load certificates")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteCertificate(deleteTarget.id)
      toast.success("Certificate deleted")
      setCertificates((prev) =>
        prev.filter((c) => c.id !== deleteTarget.id),
      )
    } catch {
      toast.error("Failed to delete certificate")
    } finally {
      setDeleteTarget(null)
    }
  }

  if (loading) return null

  return (
    <>
      <PageHeader
        title="Certificates"
        actionLabel="New Certificate"
        actionHref="/dashboard/certificates/new"
      />

      {certificates.length === 0 ? (
        <EmptyState
          title="No certificates yet"
          description="Add your professional certifications and credentials."
          actionLabel="New Certificate"
          actionHref="/dashboard/certificates/new"
        />
      ) : (
        <DataTable
          columns={[
            { key: "title", header: "Title" },
            { key: "issuer", header: "Issuer" },
            {
              key: "date",
              header: "Date",
              render: (c) => {
                const row = c as unknown as CertificateRow
                return new Date(row.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                })
              },
            },
            {
              key: "url",
              header: "URL",
              render: (c) => {
                const row = c as unknown as CertificateRow
                return (
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-3" />
                    <span className="truncate max-w-[120px]">{row.url}</span>
                  </a>
                )
              },
            },
            { key: "sort_order", header: "Order" },
          ]}
          data={certificates as unknown as Record<string, unknown>[]}
          actions={(c) => {
            const row = c as unknown as CertificateRow
            return (
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    router.push(`/dashboard/certificates/${row.slug}`)
                  }
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTarget(row)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            )
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete certificate?"
        description={`"${deleteTarget?.title}" will be permanently deleted.`}
        onConfirm={handleDelete}
      />
    </>
  )
}
