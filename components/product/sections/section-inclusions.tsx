"use client"

import { Label } from "@/components/ui/label"
import { ArrayEditor } from "./array-editor"

interface Props {
  content: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function SectionInclusions({ content, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-[#EEE9FF] border border-[#3A2895]/10 rounded-xl p-3 text-xs text-[#3A2895]">
        <strong>Remember:</strong> Frame as benefits, not features. "Transfer" → "Stress-free private transfer from airport to hotel". "Lunch" → "Daily healthy lunch at the academy cafeteria, keeping you energised all day".
      </div>

      <div className="space-y-1.5">
        <Label className="flex items-center gap-2">
          <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-[10px]">✓</span>
          </span>
          What's Included
        </Label>
        <ArrayEditor
          items={(content.includedItems as string[]) ?? []}
          onChange={(items) => onChange("includedItems", items)}
          placeholder="e.g. Daily 3-hour coaching sessions with certified pros"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="flex items-center gap-2">
          <span className="w-4 h-4 bg-[#D0CCDF] rounded-full flex items-center justify-center">
            <span className="text-white text-[10px]">✗</span>
          </span>
          Not Included (Extras)
        </Label>
        <ArrayEditor
          items={(content.notIncludedItems as string[]) ?? []}
          onChange={(items) => onChange("notIncludedItems", items)}
          placeholder="e.g. Flights and personal transportation"
        />
      </div>
    </div>
  )
}
