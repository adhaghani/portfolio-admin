"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { getActivities, deleteActivity } from "@/lib/admin/activities"
import type { ActivityRow } from "@/lib/supabase/types"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const TYPE_OPTIONS = ["all", "program", "ambassadorship", "involvement"] as const

export default function ActivitiesListPage() {
  const router = useRouter()
  const [activities, setActivities] = useState<ActivityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [deleteTarget, setDeleteTarget] = useState<ActivityRow | null>(null)

  const fetch = useCallback(async () => {
    try {
      setActivities(await getActivities())
    } catch {
      toast.error("Failed to load activities")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  const filtered =
    filter === "all"
      ? activities
      : activities.filter((a) => a.type === filter)

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteActivity(deleteTarget.id)
      toast.success("Activity deleted")
      setActivities((prev) => prev.filter((a) => a.id !== deleteTarget.id))
    } catch {
      toast.error("Failed to delete activity")
    } finally {
      setDeleteTarget(null)
    }
  }

  if (loading) return null

  return (
    <>
      <PageHeader
        title="Activities"
        actionLabel="New Activity"
        actionHref="/dashboard/activities/new"
      />

      <div className="mb-4 flex gap-2">
        {TYPE_OPTIONS.map((t) => (
          <Button
            key={t}
            variant={filter === t ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilter(t)}
            className="font-mono text-[10px] uppercase"
          >
            {t}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No activities yet"
          description="Add your extracurricular activities and involvements."
          actionLabel="New Activity"
          actionHref="/dashboard/activities/new"
        />
      ) : (
        <DataTable
          columns={[
            { key: "title", header: "Title" },
            { key: "organization", header: "Organization" },
            {
              key: "type",
              header: "Type",
              render: (a) => {
                const row = a as unknown as ActivityRow
                return (
                  <Badge variant="outline" className="font-mono text-[10px] uppercase">
                    {row.type}
                  </Badge>
                )
              },
            },
            {
              key: "dates",
              header: "Dates",
              render: (a) => {
                const row = a as unknown as ActivityRow
                return `${row.start_date} – ${row.end_date ?? "Present"}`
              },
            },
            { key: "sort_order", header: "Order" },
          ]}
          data={filtered as unknown as Record<string, unknown>[]}
          actions={(a) => {
            const row = a as unknown as ActivityRow
            return (
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    router.push(`/dashboard/activities/${row.id}`)
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
        title="Delete activity?"
        description={`"${deleteTarget?.title}" will be permanently deleted.`}
        onConfirm={handleDelete}
      />
    </>
  )
}
