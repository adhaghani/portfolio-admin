"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Copy, Loader2, Trash2, Upload, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { getBrowserClient } from "@/lib/supabase/client"
import { getErrorMessage } from "@/lib/error-utils"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"

import type { FileObject } from "@supabase/storage-js"

const BUCKET = "content-images"
const FOLDER = "general"
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"]
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const LIST_PAGE_SIZE = 100

type MediaFile = FileObject & { path: string }

function joinPath(directory: string, name: string): string {
  return directory ? `${directory}/${name}` : name
}

function getDirectory(path: string): string {
  return path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "root"
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const supabase = getBrowserClient()

  const fetchFiles = useCallback(async () => {
    try {
      const media: MediaFile[] = []

      async function walkDirectory(directory: string) {
        let offset = 0

        while (true) {
          const { data, error } = await supabase.storage
            .from(BUCKET)
            .list(directory, {
              limit: LIST_PAGE_SIZE,
              offset,
              sortBy: { column: "name", order: "asc" },
            })
          if (error) throw error

          const entries = data ?? []

          for (const entry of entries) {
            const path = joinPath(directory, entry.name)

            if (entry.id === null) {
              await walkDirectory(path)
            } else {
              media.push({ ...entry, path })
            }
          }

          if (entries.length < LIST_PAGE_SIZE) break
          offset += LIST_PAGE_SIZE
        }
      }

      await walkDirectory("")
      media.sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime()
      )
      setFiles(media)
    } catch {
      toast.error(
        getErrorMessage(null, "Failed to load files. Is the bucket set up?")
      )
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    async function loadFiles() {
      await fetchFiles()
    }

    loadFiles()
  }, [fetchFiles])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Invalid file type. Allowed: PNG, JPEG, WebP, SVG.")
      if (inputRef.current) inputRef.current.value = ""
      return
    }

    if (file.size > MAX_SIZE) {
      toast.error("File must be under 10 MB.")
      if (inputRef.current) inputRef.current.value = ""
      return
    }

    setUploading(true)
    try {
      const path = `${FOLDER}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from(BUCKET).upload(path, file)
      if (error) throw error
      toast.success("File uploaded")
      fetchFiles()
    } catch (err) {
      toast.error(getErrorMessage(err, "Upload failed"))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const { error } = await supabase.storage
        .from(BUCKET)
        .remove([deleteTarget.path])
      if (error) throw error
      toast.success("File deleted")
      setFiles((prev) => prev.filter((file) => file.path !== deleteTarget.path))
    } catch {
      toast.error(getErrorMessage(null, "Failed to delete file"))
    } finally {
      setDeleteTarget(null)
    }
  }

  function getPublicUrl(filePath: string): string {
    return supabase.storage.from(BUCKET).getPublicUrl(filePath).data.publicUrl
  }

  async function copyUrl(file: MediaFile) {
    try {
      await navigator.clipboard.writeText(getPublicUrl(file.path))
      toast.success("URL copied to clipboard")
    } catch {
      toast.error("Could not copy URL. Select it manually and copy.")
    }
  }

  const imageFiles = files

  return (
    <>
      <PageHeader title="Media" />

      {/* Upload zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative mb-8 flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-none border border-dashed border-border/50 py-10 transition-colors hover:border-foreground/30"
      >
        <div className="pointer-events-none absolute inset-0 halftone-dots-sm text-muted-foreground/[0.03]" />
        {uploading ? (
          <Loader2 className="relative size-6 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="relative size-6 text-muted-foreground/40" />
        )}
        <span className="relative font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
          {uploading ? "Uploading..." : "Drag & drop or click to upload"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleUpload}
        className="hidden"
      />

      {!loading && imageFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="label-mono">
            {imageFiles.length}{" "}
            {imageFiles.length === 1 ? "media file" : "media files"}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">
            Click a preview or URL to copy its link
          </p>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : imageFiles.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center rounded-none border border-border/50 py-16">
          <div className="pointer-events-none absolute inset-0 halftone-dots text-muted-foreground/[0.04]" />
          <p className="relative font-mono text-sm text-muted-foreground">
            No files uploaded yet
          </p>
        </div>
      ) : (
        <DataTable
          columns={[
            {
              key: "preview",
              header: "Preview",
              render: (f) => {
                const file = f as unknown as MediaFile
                const url = getPublicUrl(file.path)
                return (
                  <button
                    type="button"
                    onClick={() => copyUrl(file)}
                    title="Click to copy URL"
                    aria-label={`Copy URL for ${file.name}`}
                    className="group relative block h-10 w-16 overflow-hidden rounded-none border border-border/30 bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <img
                      src={url}
                      alt={file.name}
                      className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-foreground/70 text-background opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      <Copy className="size-3.5" />
                    </span>
                  </button>
                )
              },
            },
            {
              key: "name",
              header: "Filename",
              render: (f) => {
                const file = f as unknown as MediaFile
                return (
                  <div className="min-w-0">
                    <span className="block truncate font-mono text-xs">
                      {file.name}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">
                      {getDirectory(file.path)}
                    </span>
                  </div>
                )
              },
            },
            {
              key: "size",
              header: "Size",
              render: (f) => {
                const file = f as unknown as MediaFile
                return (
                  <span className="font-mono text-xs text-muted-foreground">
                    {file.metadata?.size ? formatSize(file.metadata.size) : "—"}
                  </span>
                )
              },
            },
            {
              key: "created_at",
              header: "Uploaded",
              render: (f) => {
                const file = f as unknown as MediaFile
                return (
                  <span className="font-mono text-xs text-muted-foreground">
                    {file.created_at
                      ? new Date(file.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </span>
                )
              },
            },
            {
              key: "url",
              header: "URL",
              render: (f) => {
                const file = f as unknown as MediaFile
                const url = getPublicUrl(file.path)
                return (
                  <button
                    type="button"
                    onClick={() => copyUrl(file)}
                    title="Copy URL"
                    aria-label={`Copy URL for ${file.name}`}
                    className="group flex w-full min-w-0 items-center gap-2 rounded-sm text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <code className="min-w-0 flex-1 truncate font-mono text-[10px] text-muted-foreground group-hover:text-foreground">
                      {url}
                    </code>
                    <Copy className="size-3 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </button>
                )
              },
            },
          ]}
          data={imageFiles as unknown as Record<string, unknown>[]}
          actions={(f) => {
            const file = f as unknown as MediaFile
            const url = getPublicUrl(file.path)
            return (
              <div className="flex items-center justify-end gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="size-8"
                  title="Open in new tab"
                >
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTarget(file)}
                  className="size-8 text-muted-foreground hover:text-destructive"
                  title="Delete"
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
        title="Delete file?"
        description={`"${deleteTarget?.path}" will be permanently deleted.`}
        onConfirm={handleDelete}
      />
    </>
  )
}
