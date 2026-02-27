"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ArrayEditor } from "./array-editor"

interface Props {
  content: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function SectionHero({ content, onChange }: Props) {
  const balance = typeof content.balanceScore === "number" ? content.balanceScore : 50

  const balanceLabel =
    balance <= 20 ? "Full intensity"
    : balance <= 40 ? "Mostly padel"
    : balance <= 60 ? "Balanced"
    : balance <= 80 ? "Mostly relaxed"
    : "Pure relaxation"

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

      <div className="space-y-1.5">
        <Label>Highlights (Micro-summary bullet points)</Label>
        <p className="text-xs text-[#9E9BAC]">3-4 punchy bullet points for mobile users</p>
        <ArrayEditor
          items={(content.highlights as string[]) ?? []}
          onChange={(items) => onChange("highlights", items)}
          placeholder="e.g. 3h of daily coaching with certified pros"
          maxItems={4}
        />
      </div>

      {/* Padel / Relax balance */}
      <div className="pt-1 space-y-3">
        <div className="flex items-center justify-between">
          <Label>Experience Balance</Label>
          <span className="text-xs font-semibold text-[#3A2895] bg-[#EEE9FF] px-2.5 py-0.5 rounded-full">
            {balanceLabel}
          </span>
        </div>

        <div className="space-y-2">
          <div className="relative h-6 flex items-center">
            {/* Track background gradient */}
            <div
              className="absolute inset-x-0 h-2 rounded-full pointer-events-none"
              style={{
                background: `linear-gradient(to right, #3A2895 0%, #3A2895 ${balance}%, #3EC9C1 ${balance}%, #3EC9C1 100%)`,
              }}
            />
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={balance}
              onChange={(e) => onChange("balanceScore", Number(e.target.value))}
              className="relative w-full appearance-none bg-transparent cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-[#3A2895]
                [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(58,40,149,0.3)]
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-110
                [&::-moz-range-thumb]:w-5
                [&::-moz-range-thumb]:h-5
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-[#3A2895]
                [&::-moz-range-thumb]:shadow-[0_2px_6px_rgba(58,40,149,0.3)]
                [&::-webkit-slider-runnable-track]:h-0
                [&::-moz-range-track]:h-0"
            />
          </div>

          {/* Labels row */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3A2895]" />
              <span className="text-xs font-semibold text-[#3A2895]">Padel</span>
            </div>
            <span className="text-[10px] text-[#9E9BAC] tabular-nums">{balance}%</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#3EC9C1]">Relax</span>
              <span className="w-2 h-2 rounded-full bg-[#3EC9C1]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
