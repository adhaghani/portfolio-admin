"use client"

import MDEditor from "@uiw/react-md-editor"

interface MDXEditorProps {
  value: string
  onChange: (value: string) => void
  minHeight?: number
  label?: string
}

export function MDXEditor({
  value,
  onChange,
  minHeight = 300,
  label,
}: MDXEditorProps) {
  return (
    <div className="space-y-2" data-color-mode="light">
      {label && <span className="label-mono">{label}</span>}
      <div className="overflow-hidden rounded-none border border-border/50">
        <MDEditor
          value={value}
          onChange={(val) => onChange(val ?? "")}
          height={minHeight}
          preview="live"
          visibleDragbar={false}
        />
      </div>
    </div>
  )
}
