"use client"

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
import type { ProjectBlock } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MDXEditor } from "@/components/shared/mdx-editor"

interface ThinkingResultsEditorProps {
  value: ProjectBlock[]
  onChange: (blocks: ProjectBlock[]) => void
  label?: string
}

export function ThinkingResultsEditor({
  value,
  onChange,
  label,
}: ThinkingResultsEditorProps) {
  function addBlock() {
    onChange([...value, { heading: "", body: "" }])
  }

  function updateBlock(
    index: number,
    field: "heading" | "body",
    text: string,
  ) {
    const next = [...value]
    next[index] = { ...next[index], [field]: text }
    onChange(next)
  }

  function removeBlock(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function moveBlock(index: number, direction: "up" | "down") {
    const next = [...value]
    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {label && <span className="label-mono">{label}</span>}
      <div className="space-y-4">
        {value.map((block, i) => (
          <div
            key={i}
            className="space-y-2 border border-border/50 bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                Block {i + 1}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moveBlock(i, "up")}
                  disabled={i === 0}
                  className="size-7"
                >
                  <ChevronUp className="size-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moveBlock(i, "down")}
                  disabled={i === value.length - 1}
                  className="size-7"
                >
                  <ChevronDown className="size-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeBlock(i)}
                  className="size-7 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
            <Input
              value={block.heading}
              onChange={(e) => updateBlock(i, "heading", e.target.value)}
              placeholder="Block heading..."
              className="input-mono"
            />
            <MDXEditor
              value={block.body}
              onChange={(val) => updateBlock(i, "body", val)}
              minHeight={150}
            />
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addBlock}
        className="text-xs"
      >
        <Plus className="mr-1.5 size-3" />
        Add block
      </Button>
    </div>
  )
}
