"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function DynamicListEditor({
  value,
  onChange,
  placeholder = "Add item...",
  label,
}: {
  value: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  label?: string
}) {
  function addItem() {
    onChange([...value, ""])
  }

  function updateItem(index: number, text: string) {
    const next = [...value]
    next[index] = text
    onChange(next)
  }

  function removeItem(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      {label && <span className="label-mono">{label}</span>}
      <div className="space-y-2">
        {value.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={`${placeholder} ${i + 1}`}
              className="input-mono flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(i)}
              className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        className="text-xs"
      >
        <Plus className="mr-1.5 size-3" />
        Add item
      </Button>
    </div>
  )
}
