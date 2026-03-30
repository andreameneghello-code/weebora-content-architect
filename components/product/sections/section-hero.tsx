"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrayEditor } from "./array-editor"

interface Props {
  content: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function SectionHero({ content, onChange }: Props) {
  const shortDesc = (content.shortDescription as string) ?? ""
  const charsLeft = 65 - shortDesc.length

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label>Title (H1)</Label>
          <Input
            value={(content.title as string) ?? ""}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="e.g. 5-Day Intensive Camp in Madrid – M3 Academy"
          />
          <p className="text-xs text-[#9E9BAC]">Benefit-driven, follows the category formula</p>
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label>Subtitle / Tagline</Label>
          <Input
            value={(content.subtitle as string) ?? ""}
            onChange={(e) => onChange("subtitle", e.target.value)}
            placeholder="e.g. Train like a pro in the heart of Madrid"
          />
        </div>

        <div className="space-y-1.5">
          <Label>City / Location</Label>
          <Input
            value={(content.location as string) ?? ""}
            onChange={(e) => onChange("location", e.target.value)}
            placeholder="e.g. Madrid"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Country</Label>
          <Input
            value={(content.country as string) ?? ""}
            onChange={(e) => onChange("country", e.target.value)}
            placeholder="e.g. Spain"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Duration</Label>
          <Input
            value={(content.duration as string) ?? ""}
            onChange={(e) => onChange("duration", e.target.value)}
            placeholder="e.g. 5 days"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Price From</Label>
          <Input
            value={(content.priceFrom as string) ?? ""}
            onChange={(e) => onChange("priceFrom", e.target.value)}
            placeholder="e.g. €499"
          />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label>Difficulty Level</Label>
          <Input
            value={(content.difficultyLevel as string) ?? ""}
            onChange={(e) => onChange("difficultyLevel", e.target.value)}
            placeholder="e.g. All levels / Intermediate & Advanced"
          />
        </div>
      </div>

      {/* Short description — 600 char cap */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>Short Description</Label>
          <span className={`text-xs font-semibold tabular-nums ${charsLeft < 0 ? "text-[#D94F4F]" : charsLeft < 10 ? "text-amber-500" : "text-[#9E9BAC]"}`}>
            {charsLeft} chars left
          </span>
        </div>
        <Textarea
          value={shortDesc}
          onChange={(e) => {
            if (e.target.value.length <= 65) onChange("shortDescription", e.target.value)
          }}
          placeholder="Compelling 1–2 sentence summary for cards and listings…"
          className="h-24"
          maxLength={65}
        />
        <p className="text-xs text-[#9E9BAC]">Max 65 characters · used for product cards and search listings</p>
      </div>

      <div className="space-y-1.5">
        <Label>Highlights (Micro-summary bullet points)</Label>
        <p className="text-xs text-[#9E9BAC]">3–6 short keyword tags for mobile users</p>
        <ArrayEditor
          items={(content.highlights as string[]) ?? []}
          onChange={(items) => onChange("highlights", items)}
          placeholder="e.g. 5-Star Hotel"
          maxItems={6}
        />
      </div>
    </div>
  )
}
