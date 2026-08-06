"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { getActivities, deleteActivity } from "@/lib/admin/activities"
import type { ActivityRow } from "@/lib/supabase/types"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const TYPES = ["all", "program", "ambassadorship", "involvement"] as const

export default function ActivitiesListPage() {
  const router = useRouter()
  const [activities, setActivities] = useState<ActivityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [deleteTarget, setDeleteTarget] = useState<ActivityRow | null>(null)

  const fetch = useCallback(async () => {
    try { setActivities(await getActivities()) }
    catch { toast.error("Failed to load activities") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const filtered = filter === "all" ? activities : activities.filter((a) => a.type === filter)

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteActivity(deleteTarget.id)
      toast.success("Activity deleted")
      setActivities((prev) => prev.filter((a) => a.id !== deleteTarget.id))
    } catch { toast.error("Failed to delete activity") }
    finally { setDeleteTarget(null) }
  }

  if (loading) return null

  return (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="heading-mono">Activities</h1>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {activities.length} {activities.length === 1 ? "activity" : "activities"}
          </p>
        </div>
        <Button asChild className="bg-foreground text-background hover:bg-foreground/90">
          <a href="/dashboard/activities/new">
            <Plus className="mr-1.5 size-4" />
            New activity
          </a>
        </Button>
      </div>

      <div className="mb-6 flex items-center rounded-none border border-border/50 w-fit">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
              TYPES.indexOf(t) > 0 ? "border-l border-border/50" : ""
            } ${
              filter === t
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No activities yet" description="Add your extracurricular activities and involvements." actionLabel="New activity" actionHref="/dashboard/activities/new" />
      ) : (
        <DataTable
          columns={[
            { key: "title", header: "Title" },
            { key: "organization", header: "Organization" },
            { key: "type", header: "Type", render: (a) => {
              const row = a as unknown as ActivityRow
              return <Badge variant="outline" className="font-mono text-[10px] uppercase">{row.type}</Badge>
            }},
            { key: "dates", header: "Dates", render: (a) => {
              const row = a as unknown as ActivityRow
              return `${row.start_date} – ${row.end_date ?? "Present"}`
            }},
            { key: "sort_order", header: "Order" },
          ]}
          data={filtered as unknown as Record<string, unknown>[]}
          actions={(a) => {
            const row = a as unknown as ActivityRow
            return (
              <div className="flex items-center justify-end gap-0.5">
                <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/activities/${row.id}`)} className="size-8">
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

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete activity?" description={`"${deleteTarget?.title}" will be permanently deleted.`} onConfirm={handleDelete} />
    </div>
  )
}
