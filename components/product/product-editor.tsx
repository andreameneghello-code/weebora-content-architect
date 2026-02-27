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
import { updateProductContent, type LocalProduct, type Language } from "@/lib/local-storage"
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

const SECTIONS = [
  { id: "hero",         label: "Hero",           icon: Star,          Component: SectionHero },
  { id: "experience",   label: "The Experience",  icon: AlignLeft,     Component: SectionExperience },
  { id: "venue",        label: "Venue",           icon: Building2,     Component: SectionVenue },
  { id: "travel-detail",label: "Travel Detail",   icon: Plane,         Component: SectionTravelDetail },
  { id: "inclusions",   label: "Inclusions",      icon: ListChecks,    Component: SectionInclusions },
  { id: "itinerary",    label: "Itinerary",       icon: Calendar,      Component: SectionItinerary },
  { id: "accommodation",label: "Accommodation",   icon: Hotel,         Component: SectionAccommodation },
  { id: "cancellation", label: "Cancellation",    icon: AlertTriangle, Component: SectionCancellation },
  { id: "partner",      label: "Partner",         icon: Handshake,     Component: SectionPartner },
  { id: "useful-info",  label: "Useful Info",     icon: Info,          Component: SectionUsefulInfo },
  { id: "seo",          label: "SEO Fields",      icon: Search,        Component: SectionSEO },
  { id: "program-profile", label: "Program Profile", icon: BarChart2, Component: SectionProgramProfile },
]

interface Props {
  product: LocalProduct
  onUpdate: (updated: LocalProduct) => void
}

export function ProductEditor({ product, onUpdate }: Props) {
  const { toast } = useToast()
  const [activeLanguage, setActiveLanguage] = useState<Language>("EN")
  const [saving, setSaving] = useState(false)
  const [savedSections, setSavedSections] = useState<Set<string>>(new Set())

  const [draftContents, setDraftContents] = useState<Record<Language, Partial<ProductContentData>>>(
    () => ({
      EN: { ...(product.contents.EN ?? {}) },
      IT: { ...(product.contents.IT ?? {}) },
      ES: { ...(product.contents.ES ?? {}) },
      FR: { ...(product.contents.FR ?? {}) },
    })
  )

  const updateField = (lang: Language, field: string, value: unknown) => {
    setDraftContents((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }))
  }

  const saveSection = (sectionId: string) => {
    setSaving(true)
    try {
      let updatedProduct: LocalProduct | null = null
      for (const lang of LANGUAGES) {
        updatedProduct = updateProductContent(product.id, lang, draftContents[lang])
      }
      if (updatedProduct) onUpdate(updatedProduct)
      setSavedSections((prev) => new Set([...prev, sectionId]))
      toast({ title: "Saved", description: "Section saved in all languages" })
    } catch {
      toast({ title: "Save failed", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const saveAll = () => {
    setSaving(true)
    try {
      let updatedProduct: LocalProduct | null = null
      for (const lang of LANGUAGES) {
        updatedProduct = updateProductContent(product.id, lang, draftContents[lang])
      }
      if (updatedProduct) onUpdate(updatedProduct)
      setSavedSections(new Set(SECTIONS.map((s) => s.id)))
      toast({ title: "All saved!", description: "All sections saved in all 4 languages" })
    } catch {
      toast({ title: "Save failed", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const sectionProps = {
    content: draftContents[activeLanguage] as Record<string, unknown>,
    onChange: (field: string, value: unknown) => updateField(activeLanguage, field, value),
  }

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

          {/* Sticky language tabs */}
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

          {/* All sections stacked */}
          <div className="space-y-4">
            {SECTIONS.map(({ id, label, icon: Icon, Component }) => {
              const isSaved = savedSections.has(id)
              return (
                <div key={id} id={`section-${id}`} className="bg-white rounded-2xl border border-[#E4E0F0] shadow-[0_2px_8px_rgba(58,40,149,0.04)] overflow-hidden">
                  {/* Section header */}
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F0EDF8]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#EEE9FF] flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-[#3A2895]" />
                      </div>
                      <h2 className="text-sm font-bold text-[#1A1530]">{label}</h2>
                      {isSaved && (
                        <CheckCircle2 size={13} className="text-[#3EC9C1]" />
                      )}
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

                  {/* Section body */}
                  <div className="p-5">
                    <Component {...sectionProps} />
                  </div>
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
