"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PolicyItem {
  condition: string
  refund: string
}

interface Props {
  content: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function SectionCancellation({ content, onChange }: Props) {
  const policy = (content.cancellationPolicy as PolicyItem[]) ?? []

  const update = (updated: PolicyItem[]) => onChange("cancellationPolicy", updated)

  const addItem = () => {
    update([...policy, { condition: "", refund: "" }])
  }

  const updateItem = (index: number, field: keyof PolicyItem, value: string) => {
    const updated = [...policy]
    updated[index] = { ...updated[index], [field]: value }
    update(updated)
  }

  const removeItem = (index: number) => {
    update(policy.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700">
        <strong>Standard format:</strong> e.g. "Cancel 31+ days before" → "70% refund"
      </div>

      <div className="space-y-2">
        {policy.length > 0 && (
          <div className="grid grid-cols-2 gap-2 px-1">
            <Label className="text-xs">Condition (when they cancel)</Label>
            <Label className="text-xs">Refund amount</Label>
          </div>
        )}

        {policy.map((item, i) => (
          <div key={i} className="flex gap-2 group items-center">
            <Input
              value={item.condition}
              onChange={(e) => updateItem(i, "condition", e.target.value)}
              placeholder="e.g. Cancel 31+ days before"
              className="flex-1"
            />
            <Input
              value={item.refund}
              onChange={(e) => updateItem(i, "refund", e.target.value)}
              placeholder="e.g. 70% refund"
              className="flex-1"
            />
            <button
              onClick={() => removeItem(i)}
              className="p-1.5 rounded hover:bg-[#FFEDED] text-[#9E9BAC] hover:text-[#D94F4F] opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={addItem} className="gap-1.5 text-xs">
        <Plus size={13} />
        Add policy tier
      </Button>
    </div>
  )
}
