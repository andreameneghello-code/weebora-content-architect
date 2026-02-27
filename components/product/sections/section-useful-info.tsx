"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Props {
  content: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function SectionUsefulInfo({ content, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="bg-[#EEE9FF] border border-[#3A2895]/10 rounded-xl p-3 text-xs text-[#3A2895]">
        <strong>Include:</strong> What to bring, dress code, skill level requirements, logistics (how to get there, nearest airport), language spoken, visa requirements if any.
      </div>
      <div className="space-y-1.5">
        <Label>Useful Information</Label>
        <Textarea
          value={(content.usefulInformation as string) ?? ""}
          onChange={(e) => onChange("usefulInformation", e.target.value)}
          placeholder="Practical tips, what to bring, logistics, skill level notes, local info..."
          className="min-h-[180px]"
        />
      </div>
    </div>
  )
}
