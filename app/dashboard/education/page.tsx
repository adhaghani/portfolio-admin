"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { getEducationEntries, deleteEducationEntry } from "@/lib/admin/education"
import type { EducationRow } from "@/lib/supabase/types"
import { getErrorMessage } from "@/lib/error-utils"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { PageLoading } from "@/components/shared/page-loading"
import { Button } from "@/components/ui/button"

export default function EducationListPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<EducationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<EducationRow | null>(null)

  const fetch = useCallback(async () => {
    try { setEntries(await getEducationEntries()) }
    catch { toast.error(getErrorMessage(null, "Failed to load education entries")) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteEducationEntry(deleteTarget.id)
      toast.success("Entry deleted")
      setEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id))
    } catch {
      toast.error(getErrorMessage(null, "Failed to delete entry"))
    } finally { setDeleteTarget(null) }
  }

  if (loading) return <PageLoading label="Education" />

  return (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="heading-mono">Education</h1>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        <Button asChild className="bg-foreground text-background hover:bg-foreground/90">
          <a href="/dashboard/education/new">
            <Plus className="mr-1.5 size-4" />
            New entry
          </a>
        </Button>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="No education entries yet"
          description="Add your education history."
          actionLabel="New entry"
          actionHref="/dashboard/education/new"
        />
      ) : (
        <DataTable
          columns={[
            { key: "institution", header: "Institution" },
            { key: "degree", header: "Degree" },
            { key: "field", header: "Field" },
            {
              key: "years",
              header: "Years",
              render: (e) => {
                const row = e as unknown as EducationRow
                return `${row.start_date} – ${row.end_date}`
              },
            },
            { key: "sort_order", header: "Order" },
          ]}
          data={entries as unknown as Record<string, unknown>[]}
          actions={(e) => {
            const row = e as unknown as EducationRow
            return (
              <div className="flex items-center justify-end gap-0.5">
                <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/education/${row.id}`)} className="size-8">
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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete education entry?"
        description={`"${deleteTarget?.institution}" will be permanently deleted.`}
        onConfirm={handleDelete}
      />
    </div>
  )
}
