"use client"

import { Plus, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Props {
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  maxItems?: number
}

export function ArrayEditor({ items, onChange, placeholder, maxItems }: Props) {
  const addItem = () => {
    if (maxItems && items.length >= maxItems) return
    onChange([...items, ""])
  }

  const updateItem = (index: number, value: string) => {
    const updated = [...items]
    updated[index] = value
    onChange(updated)
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 group">
          <GripVertical size={14} className="text-[#D0CCDF] shrink-0" />
          <Input
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
          <button
            onClick={() => removeItem(i)}
            className="p-1.5 rounded-lg hover:bg-[#FFEDED] text-[#9E9BAC] hover:text-[#D94F4F] opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      {(!maxItems || items.length < maxItems) && (
        <Button
          variant="outline"
          size="sm"
          onClick={addItem}
          className="gap-1.5 text-xs"
        >
          <Plus size={13} />
          Add item
        </Button>
      )}
    </div>
  )
}
