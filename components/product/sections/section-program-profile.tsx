"use client"

import type { ProgramProfile } from "@/lib/types"

interface Props {
  profile: ProgramProfile
  onChange: (profile: ProgramProfile) => void
}

interface SliderRowProps {
  label:    string
  sublabel: string
  value:    number
  color:    string
  onChange: (v: number) => void
}

function SliderRow({ label, sublabel, value, color, onChange }: SliderRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-[#1A1530]">{label}</span>
          <span className="ml-2 text-xs text-[#9E9BAC]">{sublabel}</span>
        </div>
        <span className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-full bg-[#F5F4FA] text-[#1A1530] border border-[#E4E0F0]">
          {value}
        </span>
      </div>
      <div className="relative h-6 flex items-center">
        <div
          className="absolute inset-x-0 h-2 rounded-full pointer-events-none"
          style={{ background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #E4E0F0 ${value}%, #E4E0F0 100%)` }}
        />
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.15)]
            [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2
            [&::-webkit-slider-runnable-track]:h-0 [&::-moz-range-track]:h-0"
          style={{ ['--tw-thumb-border-color' as string]: color }}
        />
      </div>
    </div>
  )
}

export function SectionProgramProfile({ profile, onChange }: Props) {
  const set = (key: keyof ProgramProfile) => (v: number) =>
    onChange({ ...profile, [key]: v })

  const balanceLabel =
    profile.balance <= 20 ? "Full intensity"
    : profile.balance <= 40 ? "Mostly padel"
    : profile.balance <= 60 ? "Balanced"
    : profile.balance <= 80 ? "Mostly relaxed"
    : "Pure relaxation"

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <SliderRow
          label="Technique"
          sublabel="Technical skill focus"
          value={profile.technique}
          color="#3A2895"
          onChange={set("technique")}
        />
        <SliderRow
          label="Tactics"
          sublabel="Strategic & tactical depth"
          value={profile.tactics}
          color="#6B4FD8"
          onChange={set("tactics")}
        />
        <SliderRow
          label="Play"
          sublabel="Match play & competition time"
          value={profile.play}
          color="#3EC9C1"
          onChange={set("play")}
        />
      </div>

      {/* Padel / Relax balance */}
      <div className="pt-2 border-t border-[#F0EDF8] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-[#1A1530]">Experience Balance</span>
            <span className="ml-2 text-xs text-[#9E9BAC]">Intensity vs recovery</span>
          </div>
          <span className="text-xs font-bold text-[#3A2895] bg-[#EEE9FF] px-2.5 py-0.5 rounded-full">
            {balanceLabel}
          </span>
        </div>

        <div className="space-y-2">
          <div className="relative h-6 flex items-center">
            <div
              className="absolute inset-x-0 h-2 rounded-full pointer-events-none"
              style={{
                background: `linear-gradient(to right, #3A2895 0%, #3A2895 ${profile.balance}%, #3EC9C1 ${profile.balance}%, #3EC9C1 100%)`,
              }}
            />
            <input
              type="range"
              min={0} max={100} step={5}
              value={profile.balance}
              onChange={(e) => set("balance")(Number(e.target.value))}
              className="relative w-full appearance-none bg-transparent cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#3A2895]
                [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(58,40,149,0.3)]
                [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
                [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#3A2895]
                [&::-webkit-slider-runnable-track]:h-0 [&::-moz-range-track]:h-0"
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3A2895]" />
              <span className="text-xs font-semibold text-[#3A2895]">Padel</span>
            </div>
            <span className="text-[10px] text-[#9E9BAC] tabular-nums">{profile.balance}%</span>
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
