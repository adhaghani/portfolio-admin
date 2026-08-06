"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  getEducationEntries,
  deleteEducationEntry,
} from "@/lib/admin/education"
import type { EducationRow } from "@/lib/supabase/types"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"

export default function EducationListPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<EducationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<EducationRow | null>(null)

  const fetch = useCallback(async () => {
    try {
      setEntries(await getEducationEntries())
    } catch {
      toast.error("Failed to load education entries")
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
      await deleteEducationEntry(deleteTarget.id)
      toast.success("Entry deleted")
      setEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id))
    } catch {
      toast.error("Failed to delete entry")
    } finally {
      setDeleteTarget(null)
    }
  }

  if (loading) return null

  return (
    <>
      <PageHeader
        title="Education"
        actionLabel="New Entry"
        actionHref="/dashboard/education/new"
      />

      {entries.length === 0 ? (
        <EmptyState
          title="No education entries yet"
          description="Add your education history."
          actionLabel="New Entry"
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
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    router.push(`/dashboard/education/${row.id}`)
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
        title="Delete education entry?"
        description={`"${deleteTarget?.degree}" will be permanently deleted.`}
        onConfirm={handleDelete}
      />
    </>
  )
}
