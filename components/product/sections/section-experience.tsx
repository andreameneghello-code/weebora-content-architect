"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const MAX = 600

interface Props {
  content: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function SectionExperience({ content, onChange }: Props) {
  const value = (content.experienceShort as string) ?? ""
  const len   = value.length
  const over  = len > MAX

  return (
    <div className="space-y-5">
      <div className="bg-[#EEE9FF] border border-[#3A2895]/10 rounded-xl p-3 text-xs text-[#3A2895]">
        <strong>Tip:</strong> Write a concise summary. Focus on the emotional hook, the location, and the unique selling point.
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>The Experience</Label>
          <span className={cn(
            "text-xs tabular-nums font-medium transition-colors",
            over                  ? "text-[#D94F4F]"
            : len > MAX * 0.85   ? "text-amber-500"
            :                      "text-[#9E9BAC]"
          )}>
            {len} / {MAX}
          </span>
        </div>
        <Textarea
          value={value}
          onChange={(e) => onChange("experienceShort", e.target.value)}
          placeholder="e.g. Perched above the bay of Palma, this 5-day academy puts you in the hands of former WPT coach Javier Ruiz — 3 hours of on-court work each morning, video analysis every afternoon, and the kind of setting that makes you forget you're actually training."
          className={cn(
            "min-h-[140px]",
            over && "border-[#D94F4F] focus-visible:ring-[#D94F4F]/30"
          )}
        />
        <p className="text-xs text-[#9E9BAC]">
          Max {MAX} characters. This text is used in the PDF export and as the product search snippet.
        </p>
      </div>
    </div>
  )
}
