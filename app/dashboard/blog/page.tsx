"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Pencil, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { getBlogPosts, deleteBlogPost } from "@/lib/admin/blog"
import type { BlogRow } from "@/lib/supabase/types"
import { getErrorMessage } from "@/lib/error-utils"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function BlogListPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "published" | "drafts">("all")
  const [deleteTarget, setDeleteTarget] = useState<BlogRow | null>(null)

  const fetch = useCallback(async () => {
    try {
      const data = await getBlogPosts()
      setPosts(data)
    } catch {
      toast.error(getErrorMessage(null, "Failed to load blog posts"))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const filtered = posts.filter((p) => {
    if (filter === "published" && !p.published) return false
    if (filter === "drafts" && p.published) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteBlogPost(deleteTarget.id)
      toast.success("Blog post deleted")
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    } catch {
      toast.error(getErrorMessage(null, "Failed to delete blog post"))
    } finally {
      setDeleteTarget(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="heading-mono">Blog</h1>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header + action bar */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="heading-mono">Blog</h1>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </p>
        </div>
        <Button asChild className="bg-foreground text-background hover:bg-foreground/90">
          <a href="/dashboard/blog/new">
            <Plus className="mr-1.5 size-4" />
            New post
          </a>
        </Button>
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="input-mono pl-9"
          />
        </div>
        <Separator orientation="vertical" className="h-6 bg-border/50" />
        <div className="flex items-center rounded-none border border-border/50">
          {(["all", "published", "drafts"] as const).map((f, i) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                i > 0 ? "border-l border-border/50" : ""
              } ${
                filter === f
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Plus}
          title={search ? "No matching posts" : "No blog posts yet"}
          description={
            search
              ? "Try a different search term."
              : "Create your first blog post to get started."
          }
          actionLabel={search ? undefined : "New post"}
          actionHref={search ? undefined : "/dashboard/blog/new"}
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
                const tags = (row.tags as string[]) ?? []
                if (!tags.length) return <span className="text-muted-foreground">—</span>
                return (
                  <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 3).map((t) => (
                      <Badge key={t} variant="outline" className="font-mono text-[10px]">
                        {t}
                      </Badge>
                    ))}
                    {tags.length > 3 && (
                      <Badge variant="outline" className="font-mono text-[10px]">
                        +{tags.length - 3}
                      </Badge>
                    )}
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
                  <Badge
                    variant="outline"
                    className={`font-mono text-[10px] ${
                      row.published
                        ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`}
                  >
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
              <div className="flex items-center justify-end gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/dashboard/blog/${row.slug}`)}
                  className="size-8"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTarget(row)}
                  className="size-8 text-muted-foreground hover:text-destructive"
                >
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
        title="Delete blog post?"
        description={`"${deleteTarget?.title}" will be permanently deleted.`}
        onConfirm={handleDelete}
      />
    </div>
  )
}
