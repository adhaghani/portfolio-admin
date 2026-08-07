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

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaPage() {
  const [files, setFiles] = useState<FileObject[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<FileObject | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const supabase = getBrowserClient()

  const fetchFiles = useCallback(async () => {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(FOLDER, { sortBy: { column: "created_at", order: "desc" } })
      if (error) throw error
      setFiles(data ?? [])
    } catch {
      toast.error(
        getErrorMessage(null, "Failed to load files. Is the bucket set up?"),
      )
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchFiles()
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
        .remove([`${FOLDER}/${deleteTarget.name}`])
      if (error) throw error
      toast.success("File deleted")
      setFiles((prev) => prev.filter((f) => f.name !== deleteTarget.name))
    } catch {
      toast.error(getErrorMessage(null, "Failed to delete file"))
    } finally {
      setDeleteTarget(null)
    }
  }

  function getPublicUrl(filename: string): string {
    return supabase.storage
      .from(BUCKET)
      .getPublicUrl(`${FOLDER}/${filename}`).data.publicUrl
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
        <div className="halftone-dots-sm pointer-events-none absolute inset-0 text-muted-foreground/[0.03]" />
        {uploading ? (
          <Loader2 className="relative size-6 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="relative size-6 text-muted-foreground/40" />
        )}
        <span className="relative font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
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

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : imageFiles.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center rounded-none border border-border/50 py-16">
          <div className="halftone-dots pointer-events-none absolute inset-0 text-muted-foreground/[0.04]" />
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
                const file = f as unknown as FileObject
                const url = getPublicUrl(file.name)
                return (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={url}
                      alt={file.name}
                      className="h-10 w-16 rounded-none border border-border/30 object-cover transition-opacity hover:opacity-80"
                      loading="lazy"
                    />
                  </a>
                )
              },
            },
            {
              key: "name",
              header: "Filename",
              render: (f) => {
                const file = f as unknown as FileObject
                return (
                  <span className="truncate font-mono text-xs">
                    {file.name}
                  </span>
                )
              },
            },
            {
              key: "size",
              header: "Size",
              render: (f) => {
                const file = f as unknown as FileObject
                return (
                  <span className="font-mono text-xs text-muted-foreground">
                    {file.metadata?.size
                      ? formatSize(file.metadata.size)
                      : "—"}
                  </span>
                )
              },
            },
            {
              key: "created_at",
              header: "Uploaded",
              render: (f) => {
                const file = f as unknown as FileObject
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
                const file = f as unknown as FileObject
                const url = getPublicUrl(file.name)
                return (
                  <div className="flex items-center gap-2">
                    <code className="max-w-[240px] truncate font-mono text-[10px] text-muted-foreground">
                      {url}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigator.clipboard.writeText(url)
                        toast.success("URL copied to clipboard")
                      }}
                      className="size-7 shrink-0"
                      title="Copy URL"
                    >
                      <Copy className="size-3" />
                    </Button>
                  </div>
                )
              },
            },
          ]}
          data={imageFiles as unknown as Record<string, unknown>[]}
          actions={(f) => {
            const file = f as unknown as FileObject
            const url = getPublicUrl(file.name)
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
        description={`"${deleteTarget?.name}" will be permanently deleted.`}
        onConfirm={handleDelete}
      />
    </>
  )
}
