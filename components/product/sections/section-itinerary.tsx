"use client"

import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Activity {
  time: string
  description: string
}

interface DayProgram {
  day: number
  title: string
  activities: Activity[]
}

interface Props {
  content: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function SectionItinerary({ content, onChange }: Props) {
  const program = ((content.travelProgram as DayProgram[]) ?? []).map((d) => ({
    ...d,
    activities: d.activities ?? [],
  }))

  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0]))

  const update = (updated: DayProgram[]) => onChange("travelProgram", updated)

  const addDay = () => {
    update([...program, { day: program.length + 1, title: `Day ${program.length + 1}`, activities: [] }])
  }

  const removeDay = (index: number) => {
    const updated = program.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 }))
    update(updated)
  }

  const updateDay = (index: number, field: keyof DayProgram, value: unknown) => {
    const updated = [...program]
    updated[index] = { ...updated[index], [field]: value }
    update(updated)
  }

  const addActivity = (dayIndex: number) => {
    const updated = [...program]
    updated[dayIndex].activities = [...updated[dayIndex].activities, { time: "", description: "" }]
    update(updated)
  }

  const updateActivity = (dayIndex: number, actIndex: number, field: keyof Activity, value: string) => {
    const updated = [...program]
    updated[dayIndex].activities[actIndex] = { ...updated[dayIndex].activities[actIndex], [field]: value }
    update(updated)
  }

  const removeActivity = (dayIndex: number, actIndex: number) => {
    const updated = [...program]
    updated[dayIndex].activities = updated[dayIndex].activities.filter((_, i) => i !== actIndex)
    update(updated)
  }

  const toggleDay = (index: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div className="space-y-3">
      {program.length === 0 && (
        <div className="text-center py-8 text-[#9E9BAC] bg-[#F5F4FA] rounded-xl border border-dashed border-[#E4E0F0]">
          <p className="text-sm">No days added yet</p>
        </div>
      )}

      {program.map((day, dayIndex) => {
        const isExpanded = expandedDays.has(dayIndex)
        return (
          <div key={dayIndex} className="border border-[#E4E0F0] rounded-xl overflow-hidden">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#F5F4FA] transition-colors"
              onClick={() => toggleDay(dayIndex)}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 bg-[#3A2895] text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                  {day.day}
                </span>
                <span className="font-medium text-[#1A1530] text-sm">{day.title || `Day ${day.day}`}</span>
                <span className="text-xs text-[#9E9BAC]">({day.activities.length} activities)</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); removeDay(dayIndex) }}
                  className="p-1 rounded hover:bg-[#FFEDED] text-[#9E9BAC] hover:text-[#D94F4F]"
                >
                  <Trash2 size={13} />
                </button>
                {isExpanded ? <ChevronUp size={16} className="text-[#9E9BAC]" /> : <ChevronDown size={16} className="text-[#9E9BAC]" />}
              </div>
            </div>

            {isExpanded && (
              <div className="p-4 pt-0 border-t border-[#F0EDF8] space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Day title</Label>
                  <Input
                    value={day.title}
                    onChange={(e) => updateDay(dayIndex, "title", e.target.value)}
                    placeholder="e.g. Monday – Arrival & First Session"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Activities</Label>
                  {day.activities.map((act, actIndex) => (
                    <div key={actIndex} className="flex gap-2 group items-center">
                      <Input
                        value={act.time}
                        onChange={(e) => updateActivity(dayIndex, actIndex, "time", e.target.value)}
                        placeholder="09:00 - 10:30"
                        className="w-32 text-xs"
                      />
                      <Input
                        value={act.description}
                        onChange={(e) => updateActivity(dayIndex, actIndex, "description", e.target.value)}
                        placeholder="Activity description"
                        className="flex-1 text-xs"
                      />
                      <button
                        onClick={() => removeActivity(dayIndex, actIndex)}
                        className="p-1.5 rounded hover:bg-[#FFEDED] text-[#9E9BAC] hover:text-[#D94F4F] opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addActivity(dayIndex)} className="gap-1 text-xs">
                    <Plus size={12} />
                    Add activity
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      <Button variant="outline" onClick={addDay} className="gap-2 w-full">
        <Plus size={15} />
        Add day
      </Button>
    </div>
  )
}
