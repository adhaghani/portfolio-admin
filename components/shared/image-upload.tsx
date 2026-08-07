"use client"

import { useCallback, useRef, useState } from "react"
import { Copy, Loader2, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"
import { getBrowserClient } from "@/lib/supabase/client"
import { getErrorMessage } from "@/lib/error-utils"
import { Button } from "@/components/ui/button"

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"]
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  bucket?: string
  path?: string
  label?: string
}

export function ImageUpload({
  value,
  onChange,
  bucket = "content-images",
  path = "general",
  label,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error("Invalid file type. Allowed: PNG, JPEG, WebP, SVG.")
        if (inputRef.current) inputRef.current.value = ""
        return
      }

      if (file.size > MAX_SIZE) {
        toast.error("File must be under 5 MB.")
        if (inputRef.current) inputRef.current.value = ""
        return
      }

      setUploading(true)
      setError(null)

      try {
        const supabase = getBrowserClient()
        const filePath = `${path}/${Date.now()}-${file.name}`

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const publicUrl = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath).data.publicUrl

        onChange(publicUrl)
        toast.success("Image uploaded")
      } catch (err) {
        const msg = getErrorMessage(err, "Upload failed")
        setError(msg)
        toast.error(msg)
      } finally {
        setUploading(false)
        if (inputRef.current) inputRef.current.value = ""
      }
    },
    [bucket, path, onChange],
  )

  function handleRemove() {
    onChange(null)
  }

  function copyUrl() {
    if (value) {
      navigator.clipboard.writeText(value)
      toast.success("URL copied to clipboard")
    }
  }

  if (value) {
    return (
      <div className="space-y-2">
        {label && <span className="label-mono">{label}</span>}
        <div className="overflow-hidden rounded-none border border-border/50">
          <img
            src={value}
            alt="Uploaded image"
            className="aspect-video w-full object-cover"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="truncate font-mono text-[10px] text-muted-foreground">
            {value}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={copyUrl}
            className="size-7 shrink-0"
          >
            <Copy className="size-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {label && <span className="label-mono">{label}</span>}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-none border border-dashed border-border/50 py-10 transition-colors hover:border-foreground/30"
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
        {error && (
          <span className="relative font-mono text-[10px] text-destructive">
            {error}
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  )
}
