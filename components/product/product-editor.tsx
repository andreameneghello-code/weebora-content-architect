"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronLeft, Save, Eye, CheckCircle2, Loader2,
  Star, AlignLeft, Building2, Plane, ListChecks,
  Calendar, Hotel, AlertTriangle, Handshake, Info, Search, BarChart2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/lib/use-toast"
import { CATEGORY_LABELS, LANGUAGE_LABELS, LANGUAGE_FLAGS } from "@/lib/tone-of-voice"
import {
  updateProductContent,
  updateProgramProfile,
} from "@/lib/api-client"
import type { Product, Language, ProgramProfile } from "@/lib/types"
import type { ProductContentData } from "@/lib/gemini"
import { SectionHero } from "./sections/section-hero"
import { SectionExperience } from "./sections/section-experience"
import { SectionVenue } from "./sections/section-venue"
import { SectionTravelDetail } from "./sections/section-travel-detail"
import { SectionInclusions } from "./sections/section-inclusions"
import { SectionItinerary } from "./sections/section-itinerary"
import { SectionAccommodation } from "./sections/section-accommodation"
import { SectionCancellation } from "./sections/section-cancellation"
import { SectionPartner } from "./sections/section-partner"
import { SectionUsefulInfo } from "./sections/section-useful-info"
import { SectionSEO } from "./sections/section-seo"
import { SectionProgramProfile } from "./sections/section-program-profile"

const LANGUAGES: Language[] = ["EN", "IT", "ES", "FR"]

interface Props {
  product:  Product
  onUpdate: (updated: Product) => void
}

export function ProductEditor({ product, onUpdate }: Props) {
  const { toast } = useToast()
  const [activeLanguage, setActiveLanguage] = useState<Language>("EN")
  const [saving,    setSaving]    = useState(false)
  const [savedSecs, setSavedSecs] = useState<Set<string>>(new Set())

  // Per-language content draft
  const [draftContents, setDraftContents] = useState<Record<Language, Partial<ProductContentData>>>(
    () => ({
      EN: { ...(product.contents.EN ?? {}) },
      IT: { ...(product.contents.IT ?? {}) },
      ES: { ...(product.contents.ES ?? {}) },
      FR: { ...(product.contents.FR ?? {}) },
    })
  )

  // Program profile draft (language-independent)
  const [draftProfile, setDraftProfile] = useState<ProgramProfile>(
    product.programProfile ?? { technique: 50, tactics: 50, play: 50, balance: 50 }
  )

  const updateField = (lang: Language, field: string, value: unknown) =>
    setDraftContents((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }))

  const saveSection = async (sectionId: string) => {
    setSaving(true)
    try {
      let updated: Product | null = null
      if (sectionId === "program-profile") {
        updated = await updateProgramProfile(product.id, draftProfile)
      } else {
        for (const lang of LANGUAGES) {
          updated = await updateProductContent(product.id, lang, draftContents[lang])
        }
      }
      if (updated) onUpdate(updated)
      setSavedSecs((prev) => new Set([...prev, sectionId]))
      toast({ title: "Saved", description: "Section saved successfully" })
    } catch {
      toast({ title: "Save failed", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const saveAll = async () => {
    setSaving(true)
    try {
      let updated: Product | null = null
      for (const lang of LANGUAGES) {
        updated = await updateProductContent(product.id, lang, draftContents[lang])
      }
      updated = await updateProgramProfile(product.id, draftProfile)
      if (updated) onUpdate(updated)
      setSavedSecs(new Set([...CONTENT_SECTIONS.map((s) => s.id), "program-profile"]))
      toast({ title: "All saved!", description: "All sections saved in all 4 languages" })
    } catch {
      toast({ title: "Save failed", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const sectionProps = {
    content:  draftContents[activeLanguage] as Record<string, unknown>,
    onChange: (field: string, value: unknown) => updateField(activeLanguage, field, value),
  }

  const CONTENT_SECTIONS = [
    { id: "hero",          label: "Hero",           icon: Star,          node: <SectionHero {...sectionProps} /> },
    { id: "experience",    label: "The Experience",  icon: AlignLeft,     node: <SectionExperience {...sectionProps} /> },
    { id: "venue",         label: "Venue",           icon: Building2,     node: <SectionVenue {...sectionProps} /> },
    { id: "travel-detail", label: "Travel Detail",   icon: Plane,         node: <SectionTravelDetail {...sectionProps} /> },
    { id: "inclusions",    label: "Inclusions",      icon: ListChecks,    node: <SectionInclusions {...sectionProps} /> },
    { id: "itinerary",     label: "Itinerary",       icon: Calendar,      node: <SectionItinerary {...sectionProps} /> },
    { id: "accommodation", label: "Accommodation",   icon: Hotel,         node: <SectionAccommodation {...sectionProps} /> },
    { id: "cancellation",  label: "Cancellation",    icon: AlertTriangle, node: <SectionCancellation {...sectionProps} /> },
    { id: "partner",       label: "Partner",         icon: Handshake,     node: <SectionPartner {...sectionProps} /> },
    { id: "useful-info",   label: "Useful Info",     icon: Info,          node: <SectionUsefulInfo {...sectionProps} /> },
    { id: "seo",           label: "SEO Fields",      icon: Search,        node: <SectionSEO {...sectionProps} /> },
  ]

  const ALL_SECTIONS = [
    ...CONTENT_SECTIONS,
    {
      id:    "program-profile",
      label: "Program Profile",
      icon:  BarChart2,
      node:  (
        <SectionProgramProfile
          profile={draftProfile}
          onChange={setDraftProfile}
        />
      ),
      langIndependent: true,
    },
  ]

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="h-14 bg-white border-b border-[#E4E0F0] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <button className="flex items-center gap-1.5 text-sm text-[#6B6882] hover:text-[#3A2895] transition-colors">
              <ChevronLeft size={16} />
              Dashboard
            </button>
          </Link>
          <span className="text-[#E4E0F0]">/</span>
          <div className="flex items-center gap-2">
            <Badge variant={product.category.toLowerCase() as never}>
              {CATEGORY_LABELS[product.category] ?? product.category}
            </Badge>
            <Badge variant="outline">{product.status}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/products/${product.id}/preview`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Eye size={14} />
              Preview
            </Button>
          </Link>
          <Button size="sm" onClick={saveAll} disabled={saving} className="gap-1.5 shadow-[0_2px_8px_rgba(58,40,149,0.2)]">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save All
          </Button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto bg-[#F5F4FA]">
        <div className="max-w-3xl mx-auto px-6 py-6">

          {/* Sticky language tabs (hidden for language-independent sections) */}
          <div className="sticky top-0 z-10 -mx-6 px-6 py-3 bg-[#F5F4FA]/95 backdrop-blur-sm border-b border-[#E4E0F0] mb-6">
            <Tabs value={activeLanguage} onValueChange={(v) => setActiveLanguage(v as Language)}>
              <TabsList>
                {LANGUAGES.map((lang) => (
                  <TabsTrigger key={lang} value={lang} className="gap-1.5 text-xs">
                    <span>{LANGUAGE_FLAGS[lang]}</span>
                    {LANGUAGE_LABELS[lang]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-4">
            {ALL_SECTIONS.map(({ id, label, icon: Icon, node, ...rest }) => {
              const isLangIndep = "langIndependent" in rest && rest.langIndependent
              const isSaved = savedSecs.has(id)
              return (
                <div
                  key={id}
                  id={`section-${id}`}
                  className="bg-white rounded-2xl border border-[#E4E0F0] shadow-[0_2px_8px_rgba(58,40,149,0.04)] overflow-hidden"
                >
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F0EDF8]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#EEE9FF] flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-[#3A2895]" />
                      </div>
                      <h2 className="text-sm font-bold text-[#1A1530]">{label}</h2>
                      {isLangIndep && (
                        <span className="text-[10px] font-semibold text-[#9E9BAC] bg-[#F5F4FA] px-2 py-0.5 rounded-full border border-[#E4E0F0]">
                          All languages
                        </span>
                      )}
                      {isSaved && <CheckCircle2 size={13} className="text-[#3EC9C1]" />}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => saveSection(id)}
                      disabled={saving}
                      className="gap-1.5 h-7 text-xs px-3"
                    >
                      {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                      Save
                    </Button>
                  </div>
                  <div className="p-5">{node}</div>
                </div>
              )
            })}
          </div>

          <div className="h-8" />
        </div>
      </div>
    </div>
  )
}
