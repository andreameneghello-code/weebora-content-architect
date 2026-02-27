"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Props {
  content: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function SectionTravelDetail({ content, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="bg-[#EEE9FF] border border-[#3A2895]/10 rounded-xl p-3 text-xs text-[#3A2895]">
        <strong>Tip:</strong> Describe the overall structure of the trip. What does each day look like? What training methodology is used? What can guests expect? This is the "Logic" section - build trust by listing benefits, not just features.
      </div>
      <div className="space-y-1.5">
        <Label>Travel Detail Description</Label>
        <Textarea
          value={(content.travelDetailDescription as string) ?? ""}
          onChange={(e) => onChange("travelDetailDescription", e.target.value)}
          placeholder="Describe what the trip involves, the daily structure, training methodology, and what participants can expect..."
          className="min-h-[180px]"
        />
      </div>
    </div>
  )
}
