"use client"

import { Eye, Trophy } from "lucide-react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Props {
  content: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

// ── SVG icons ────────────────────────────────────────────────────────────────

function PadelRacketIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16"
      fill="none" className={className}
      aria-hidden="true"
    >
      {/* head */}
      <ellipse cx="8" cy="6.5" rx="4.5" ry="5" stroke="currentColor" strokeWidth="1.4" />
      {/* string cross */}
      <line x1="8" y1="1.5" x2="8" y2="11.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.55" />
      <line x1="3.5" y1="6.5" x2="12.5" y2="6.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.55" />
      {/* handle */}
      <line x1="8" y1="11.5" x2="8" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function TennisBall({ active, size = 22 }: { active: boolean; size?: number }) {
  const fill = active ? "#3EC9C1" : "#E4E0F0"
  const seam = active ? "white" : "#C8C4D4"
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="10" fill={fill} />
      {/* left seam */}
      <path
        d="M4.5 7.5 C7.5 9 7.5 13 4.5 14.5"
        stroke={seam} strokeWidth="1.6" strokeLinecap="round" fill="none"
      />
      {/* right seam */}
      <path
        d="M17.5 7.5 C14.5 9 14.5 13 17.5 14.5"
        stroke={seam} strokeWidth="1.6" strokeLinecap="round" fill="none"
      />
    </svg>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SkillRow({
  icon,
  label,
  value,
  field,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  value: number
  field: string
  onChange: (field: string, value: unknown) => void
}) {
  return (
    <div className="flex items-center gap-4">
      {/* Icon + label */}
      <div className="flex items-center gap-2 w-28 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-[#F0FAFA] flex items-center justify-center text-[#1FA89E]">
          {icon}
        </div>
        <span className="text-sm font-medium text-[#1A1530]">{label}</span>
      </div>

      {/* Tennis ball rating */}
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(field, i + 1)}
            className={cn(
              "rounded-full transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3EC9C1]",
              value === i + 1 && "scale-110"
            )}
            title={`Set ${label} to ${i + 1}`}
          >
            <TennisBall active={i < value} />
          </button>
        ))}
      </div>

      {/* Numeric badge */}
      <span className="ml-auto text-xs font-bold text-[#3EC9C1] bg-[#E6F9F8] px-2 py-0.5 rounded-full min-w-[2rem] text-center">
        {value > 0 ? `${value}/5` : "—"}
      </span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function SectionProgramProfile({ content, onChange }: Props) {
  const technique = typeof content.profileTechnique === "number" ? content.profileTechnique : 0
  const tactics   = typeof content.profileTactics   === "number" ? content.profileTactics   : 0
  const play      = typeof content.profilePlay      === "number" ? content.profilePlay      : 0
  const intensity = typeof content.profileIntensity === "number" ? content.profileIntensity : 50

  const intensityLabel =
    intensity <= 15 ? "Pure relaxation"
    : intensity <= 35 ? "Mostly relaxed"
    : intensity <= 65 ? "Balanced"
    : intensity <= 85 ? "Mostly intensive"
    : "Max intensity"

  const SKILLS = [
    { field: "profileTechnique", label: "Technique", value: technique, icon: <PadelRacketIcon /> },
    { field: "profileTactics",   label: "Tactics",   value: tactics,   icon: <Eye size={14} /> },
    { field: "profilePlay",      label: "Play",      value: play,      icon: <Trophy size={14} /> },
  ]

  return (
    <div className="space-y-6">

      {/* Skills */}
      <div className="space-y-1.5">
        <Label>Skill Levels</Label>
        <p className="text-xs text-[#9E9BAC] mb-3">
          Click the balls to rate each skill dimension from 1 to 5.
        </p>
        <div className="space-y-3 bg-[#FAFAF9] rounded-xl border border-[#F0EDF8] p-4">
          {SKILLS.map((skill) => (
            <SkillRow key={skill.field} {...skill} onChange={onChange} />
          ))}
        </div>
      </div>

      {/* Intensity slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Experience Intensity</Label>
          <span className="text-xs font-semibold text-[#3EC9C1] bg-[#E6F9F8] px-2.5 py-0.5 rounded-full border border-[#3EC9C1]/20">
            {intensityLabel}
          </span>
        </div>

        <div className="space-y-2">
          <div className="relative h-6 flex items-center">
            {/* Track */}
            <div
              className="absolute inset-x-0 h-2 rounded-full pointer-events-none"
              style={{
                background: `linear-gradient(to right, #E4E0F0 0%, #E4E0F0 ${100 - intensity}%, #3EC9C1 ${100 - intensity}%, #3EC9C1 100%)`,
              }}
            />
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={intensity}
              onChange={(e) => onChange("profileIntensity", Number(e.target.value))}
              className="relative w-full appearance-none bg-transparent cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-[#3EC9C1]
                [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(62,201,193,0.4)]
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-110
                [&::-moz-range-thumb]:w-5
                [&::-moz-range-thumb]:h-5
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-[#3EC9C1]
                [&::-moz-range-thumb]:shadow-[0_2px_6px_rgba(62,201,193,0.4)]
                [&::-webkit-slider-runnable-track]:h-0
                [&::-moz-range-track]:h-0"
            />
          </div>

          {/* Labels */}
          <div className="flex justify-between items-center text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-[#9E9BAC]">
              <span className="w-2 h-2 rounded-full bg-[#E4E0F0]" />
              Relax
            </div>
            <span className="text-[10px] text-[#9E9BAC] tabular-nums">{intensity}%</span>
            <div className="flex items-center gap-1.5 text-[#1FA89E]">
              Padel
              <span className="w-2 h-2 rounded-full bg-[#3EC9C1]" />
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
