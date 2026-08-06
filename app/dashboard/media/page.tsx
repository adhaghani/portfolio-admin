"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Copy, Loader2, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"
import { getBrowserClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"

import type { FileObject } from "@supabase/storage-js"

const BUCKET = "content-images"

export default function MediaPage() {
  const [files, setFiles] = useState<FileObject[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<FileObject | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchFiles = useCallback(async () => {
    try {
      const supabase = getBrowserClient()
      const { data, error } = await supabase.storage.from(BUCKET).list("", {
        sortBy: { column: "created_at", order: "desc" },
      })
      if (error) throw error
      setFiles(data ?? [])
    } catch {
      toast.error("Failed to load files. Is the bucket set up?")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const supabase = getBrowserClient()
      const path = `general/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from(BUCKET).upload(path, file)
      if (error) throw error
      toast.success("File uploaded")
      fetchFiles()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Upload failed",
      )
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const supabase = getBrowserClient()
      const { error } = await supabase.storage
        .from(BUCKET)
        .remove([deleteTarget.name])
      if (error) throw error
      toast.success("File deleted")
      setFiles((prev) => prev.filter((f) => f.name !== deleteTarget.name))
    } catch {
      toast.error("Failed to delete file")
    } finally {
      setDeleteTarget(null)
    }
  }

  function copyUrl(path: string) {
    const supabase = getBrowserClient()
    const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
    navigator.clipboard.writeText(url)
    toast.success("URL copied to clipboard")
  }

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
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleUpload}
        className="hidden"
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : files.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center rounded-none border border-border/50 py-16">
          <div className="halftone-dots pointer-events-none absolute inset-0 text-muted-foreground/[0.04]" />
          <p className="relative font-mono text-sm text-muted-foreground">
            No files uploaded yet
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {files
            .filter((f) => f.id) // skip folders
            .map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between border border-border/50 bg-card p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs text-foreground">
                    {file.name}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {file.metadata?.size
                      ? `${(file.metadata.size / 1024).toFixed(0)} KB`
                      : "—"}{" "}
                    ·{" "}
                    {file.created_at ? new Date(file.created_at).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyUrl(file.name)}
                    className="size-7"
                  >
                    <Copy className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(file)}
                    className="size-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
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
