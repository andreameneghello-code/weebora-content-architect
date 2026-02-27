"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrayEditor } from "./array-editor"

interface Props {
  content: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function SectionVenue({ content, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label>Venue Name</Label>
          <Input
            value={(content.venueName as string) ?? ""}
            onChange={(e) => onChange("venueName", e.target.value)}
            placeholder="e.g. M3 Padel Academy"
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Venue Location</Label>
          <Input
            value={(content.venueLocation as string) ?? ""}
            onChange={(e) => onChange("venueLocation", e.target.value)}
            placeholder="e.g. Madrid, Spain"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Venue Description</Label>
        <Textarea
          value={(content.venueDescription as string) ?? ""}
          onChange={(e) => onChange("venueDescription", e.target.value)}
          placeholder="Describe the venue, its atmosphere, location, and what makes it special..."
          className="min-h-[120px]"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Venue Amenities</Label>
        <ArrayEditor
          items={(content.venueAmenities as string[]) ?? []}
          onChange={(items) => onChange("venueAmenities", items)}
          placeholder="e.g. 18 panoramic padel courts"
        />
      </div>
    </div>
  )
}
