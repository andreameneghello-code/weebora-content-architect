"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface Props {
  content: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function SectionPartner({ content, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Partner Name</Label>
        <Input
          value={(content.partnerName as string) ?? ""}
          onChange={(e) => onChange("partnerName", e.target.value)}
          placeholder="e.g. M3 Padel Academy"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Partner Description</Label>
        <Textarea
          value={(content.partnerDescription as string) ?? ""}
          onChange={(e) => onChange("partnerDescription", e.target.value)}
          placeholder="Describe the partner, their expertise, credentials, and their relationship with Weebora..."
          className="min-h-[140px]"
        />
      </div>
    </div>
  )
}
