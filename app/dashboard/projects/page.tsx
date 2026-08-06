"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { getProjects, deleteProject } from "@/lib/admin/projects"
import type { ProjectRow } from "@/lib/supabase/types"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ProjectsListPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<ProjectRow | null>(null)

  const fetch = useCallback(async () => {
    try {
      setProjects(await getProjects())
    } catch {
      toast.error("Failed to load projects")
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
      await deleteProject(deleteTarget.id)
      toast.success("Project deleted")
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    } catch {
      toast.error("Failed to delete project")
    } finally {
      setDeleteTarget(null)
    }
  }

  if (loading) return null

  return (
    <>
      <PageHeader
        title="Projects"
        actionLabel="New Project"
        actionHref="/dashboard/projects/new"
      />

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Add your first project to showcase your work."
          actionLabel="New Project"
          actionHref="/dashboard/projects/new"
        />
      ) : (
        <DataTable
          columns={[
            { key: "title", header: "Title" },
            { key: "tagline", header: "Tagline" },
            { key: "year", header: "Year" },
            {
              key: "featured",
              header: "Featured",
              render: (p) =>
                (p as unknown as ProjectRow).featured ? (
                  <Badge variant="outline" className="font-mono text-[10px]">
                    Featured
                  </Badge>
                ) : (
                  "—"
                ),
            },
          ]}
          data={projects as unknown as Record<string, unknown>[]}
          actions={(p) => {
            const row = p as unknown as ProjectRow
            return (
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    router.push(`/dashboard/projects/${row.slug}`)
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
        title="Delete project?"
        description={`"${deleteTarget?.title}" will be permanently deleted.`}
        onConfirm={handleDelete}
      />
    </>
  )
}
