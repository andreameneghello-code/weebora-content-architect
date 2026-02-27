"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface Props {
  content: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length
  const isOver = len > max
  return (
    <span className={`text-xs ${isOver ? "text-red-500" : "text-[#9E9BAC]"}`}>
      {len}/{max}
    </span>
  )
}

export function SectionSEO({ content, onChange }: Props) {
  const metaTitle = (content.metaTitle as string) ?? ""
  const metaDesc = (content.metaDescription as string) ?? ""
  const slug = (content.slug as string) ?? ""

  return (
    <div className="space-y-5">
      <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-xs text-purple-700">
        <strong>SEO Rules:</strong> Meta title max 60 chars · Meta description max 160 chars · Slug: lowercase, dashes only (e.g. "5-day-padel-camp-madrid-m3-academy")
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>Meta Title</Label>
          <CharCount value={metaTitle} max={60} />
        </div>
        <Input
          value={metaTitle}
          onChange={(e) => onChange("metaTitle", e.target.value)}
          placeholder="e.g. 5-Day Intensive Padel Camp in Madrid – M3 Academy"
        />
        <p className="text-xs text-[#9E9BAC]">Follows the category formula. Keyword-rich, front-loaded with value.</p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>Meta Description</Label>
          <CharCount value={metaDesc} max={160} />
        </div>
        <Textarea
          value={metaDesc}
          onChange={(e) => onChange("metaDescription", e.target.value)}
          placeholder="2-3 sentences that include the main keywords at least 3 times and list key benefits..."
          className="min-h-[80px]"
        />
      </div>

      <div className="space-y-1.5">
        <Label>URL Slug</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#9E9BAC] whitespace-nowrap">weebora.com/en/...</span>
          <Input
            value={slug}
            onChange={(e) => onChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"))}
            placeholder="5-day-padel-camp-madrid"
          />
        </div>
        <p className="text-xs text-[#9E9BAC]">Lowercase letters, numbers, and dashes only. No special characters.</p>
      </div>

      {/* Preview */}
      {(metaTitle || metaDesc) && (
        <div className="border border-[#E4E0F0] rounded-xl p-4 bg-white">
          <p className="text-xs font-medium text-[#9E9BAC] mb-3 uppercase tracking-wider">Google Preview</p>
          <div className="space-y-0.5">
            <p className="text-xs text-[#1a0dab] truncate">
              weebora.com/{slug || "your-product-slug"}
            </p>
            <p className="text-base text-[#1a0dab] font-medium truncate">{metaTitle || "Meta title preview"}</p>
            <p className="text-sm text-[#6B6882] line-clamp-2">{metaDesc || "Meta description preview..."}</p>
          </div>
        </div>
      )}
    </div>
  )
}
