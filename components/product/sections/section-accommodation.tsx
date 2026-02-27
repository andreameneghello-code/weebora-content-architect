"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrayEditor } from "./array-editor"

interface Props {
  content: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function SectionAccommodation({ content, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label>Hotel / Accommodation Name</Label>
          <Input
            value={(content.hotelName as string) ?? ""}
            onChange={(e) => onChange("hotelName", e.target.value)}
            placeholder="e.g. Hotel Puente Romano Beach Resort"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Star Rating</Label>
          <Input
            type="number"
            min={1}
            max={5}
            value={(content.hotelStars as number) ?? ""}
            onChange={(e) => onChange("hotelStars", parseInt(e.target.value) || null)}
            placeholder="e.g. 5"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Hotel Description</Label>
        <Textarea
          value={(content.hotelDescription as string) ?? ""}
          onChange={(e) => onChange("hotelDescription", e.target.value)}
          placeholder="Describe the hotel, its atmosphere, key amenities, and why it complements the padel experience..."
          className="min-h-[120px]"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Hotel Amenities</Label>
        <ArrayEditor
          items={(content.hotelAmenities as string[]) ?? []}
          onChange={(items) => onChange("hotelAmenities", items)}
          placeholder="e.g. Outdoor infinity pool with sea views"
        />
      </div>
    </div>
  )
}
