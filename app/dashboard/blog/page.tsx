"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { getBlogPosts, deleteBlogPost } from "@/lib/admin/blog"
import type { BlogRow } from "@/lib/supabase/types"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function BlogListPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showDrafts, setShowDrafts] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<BlogRow | null>(null)

  const fetch = useCallback(async () => {
    try {
      const data = await getBlogPosts()
      setPosts(data)
    } catch (err) {
      toast.error("Failed to load blog posts")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  const filtered = posts.filter((p) => {
    if (!showDrafts && !p.published) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()))
      return false
    return true
  })

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteBlogPost(deleteTarget.id)
      toast.success("Blog post deleted")
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    } catch {
      toast.error("Failed to delete blog post")
    } finally {
      setDeleteTarget(null)
    }
  }

  if (loading) return null

  return (
    <>
      <PageHeader
        title="Blog"
        actionLabel="New Post"
        actionHref="/dashboard/blog/new"
      />

      <div className="mb-4 flex items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..."
          className="input-mono max-w-xs"
        />
        <Button
          variant={showDrafts ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowDrafts(!showDrafts)}
          className="font-mono text-xs"
        >
          {showDrafts ? "All" : "Published only"}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No blog posts yet"
          description="Create your first blog post to get started."
          actionLabel="New Post"
          actionHref="/dashboard/blog/new"
        />
      ) : (
        <DataTable
          columns={[
            { key: "title", header: "Title" },
            {
              key: "date",
              header: "Date",
              render: (p) => {
                const row = p as unknown as BlogRow
                return new Date(row.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              },
            },
            {
              key: "tags",
              header: "Tags",
              render: (p) => {
                const row = p as unknown as BlogRow
                return (
                <div className="flex flex-wrap gap-1">
                  {(row.tags as string[])?.slice(0, 3).map((t) => (
                    <Badge
                      key={t}
                      variant="outline"
                      className="font-mono text-[10px]"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              )
              },
            },
            {
              key: "published",
              header: "Status",
              render: (p) => {
                const row = p as unknown as BlogRow
                return (
                <Badge variant="outline" className="font-mono text-[10px]">
                  {row.published ? "Published" : "Draft"}
                </Badge>
              )
              },
            },
          ]}
          data={filtered as unknown as Record<string, unknown>[]}
          actions={(p) => {
            const row = p as unknown as BlogRow
            return (
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    router.push(`/dashboard/blog/${row.slug}`)
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
        title="Delete blog post?"
        description={`"${deleteTarget?.title}" will be permanently deleted.`}
        onConfirm={handleDelete}
      />
    </>
  )
}
