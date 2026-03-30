"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronLeft, Edit3, MapPin, Clock, Tag, Star,
  Check, X, ChevronDown, ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CATEGORY_LABELS, LANGUAGE_FLAGS } from "@/lib/tone-of-voice"
import type { Language } from "@/lib/types"
import type { Product } from "@/lib/types"
import type { ProductContentData } from "@/lib/gemini"

const LANGUAGES: Language[] = ["EN", "IT", "ES", "FR"]

const LANG_LABELS: Record<Language, string> = {
  EN: "EN", IT: "IT", ES: "ES", FR: "FR",
}

export function ProductPreview({ product }: { product: Product }) {
  const [activeLanguage, setActiveLanguage] = useState<Language>("EN")
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0]))

  const content: Partial<ProductContentData> = product.contents[activeLanguage] ?? {}

  const highlights = (content.highlights as string[] | undefined) ?? []
  const includedItems = (content.includedItems as string[] | undefined) ?? []
  const notIncludedItems = (content.notIncludedItems as string[] | undefined) ?? []
  const venueAmenities = (content.venueAmenities as string[] | undefined) ?? []
  const hotelAmenities = (content.hotelAmenities as string[] | undefined) ?? []
  const travelProgram =
    (content.travelProgram as Array<{
      day: number
      title: string
      activities: Array<{ time: string; description: string }>
    }> | undefined) ?? []
  const cancellationPolicy =
    (content.cancellationPolicy as Array<{ condition: string; refund: string }> | undefined) ?? []

  const stars = content.hotelStars
    ? Array.from({ length: content.hotelStars }, (_, i) => i)
    : []

  const toggleDay = (index: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  return (
    <div className="min-h-full bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-10 h-14 bg-white border-b border-[#E4E0F0] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <button className="flex items-center gap-1.5 text-sm text-[#6B6882] hover:text-[#3A2895] transition-colors">
              <ChevronLeft size={16} />
              Dashboard
            </button>
          </Link>
          <span className="text-[#E4E0F0]">/</span>
          <span className="text-sm text-[#6B6882]">Preview</span>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={activeLanguage} onValueChange={(v) => setActiveLanguage(v as Language)}>
            <TabsList>
              {LANGUAGES.map((lang) => (
                <TabsTrigger key={lang} value={lang} className="gap-1 text-xs">
                  <span>{LANGUAGE_FLAGS[lang]}</span>
                  {LANG_LABELS[lang]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Link href={`/products/${product.id}/edit`}>
            <Button size="sm" className="gap-1.5 shadow-[0_2px_8px_rgba(58,40,149,0.2)]">
              <Edit3 size={14} />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-12">

        {/* Hero */}
        <section>
          <div className="flex gap-2 mb-4 flex-wrap">
            <Badge variant={product.category.toLowerCase() as never}>
              {CATEGORY_LABELS[product.category] ?? product.category}
            </Badge>
            {content.difficultyLevel && (
              <Badge variant="outline">{content.difficultyLevel}</Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold text-[#1A1530] mb-2 leading-tight">
            {content.title || "Product Title"}
          </h1>
          {content.subtitle && (
            <p className="text-lg text-[#6B6882] mb-4">{content.subtitle}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-[#9E9BAC] flex-wrap">
            {(content.location || content.country) && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} />
                {[content.location, content.country].filter(Boolean).join(", ")}
              </span>
            )}
            {content.duration && (
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {content.duration}
              </span>
            )}
            {content.priceFrom && (
              <span className="flex items-center gap-1.5 font-bold text-[#3A2895]">
                <Tag size={14} />
                From {content.priceFrom}
              </span>
            )}
          </div>

          {highlights.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-semibold text-[#9E9BAC] uppercase tracking-widest mb-3">At a Glance</p>
              <div className="flex flex-wrap gap-2">
                {highlights.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-[#3A2895] text-white"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Program Profile */}
        {product.programProfile && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-[#1A1530]">Program Profile</h2>
              <Badge variant="secondary">Internal</Badge>
            </div>
            <div className="bg-[#F5F4FA] rounded-2xl border border-[#E4E0F0] p-5 space-y-4">
              {[
                { label: "Technique", value: product.programProfile.technique, color: "#3A2895" },
                { label: "Tactics",   value: product.programProfile.tactics,   color: "#6B4FD8" },
                { label: "Play",      value: product.programProfile.play,       color: "#3EC9C1" },
              ].map((skill) => (
                <div key={skill.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#6B6882]">{skill.label}</span>
                    <span style={{ color: skill.color }}>{skill.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#E4E0F0] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${skill.value}%`, background: skill.color }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-[#F0EDF8]">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-[#3A2895]">Padel</span>
                  <span className="text-[#3EC9C1]">Relax</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${product.programProfile.balance}%`,
                    background: "linear-gradient(to right, #3A2895, #3EC9C1)",
                  }} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* The Experience */}
        {content.experienceShort && (
          <section>
            <h2 className="text-xl font-bold text-[#1A1530] mb-4">The Experience</h2>
            <p className="text-[#6B6882] leading-relaxed" style={{ lineHeight: 1.75 }}>
              {content.experienceShort as string}
            </p>
          </section>
        )}

        {/* Venue */}
        {(content.venueName || content.venueDescription) && (
          <section>
            <h2 className="text-xl font-bold text-[#1A1530] mb-2">
              {content.venueName || "Venue"}
            </h2>
            {content.venueLocation && (
              <p className="text-sm text-[#9E9BAC] flex items-center gap-1 mb-3">
                <MapPin size={13} />
                {content.venueLocation}
              </p>
            )}
            {content.venueDescription && (
              <p className="text-[#6B6882] leading-relaxed mb-4">{content.venueDescription}</p>
            )}
            {venueAmenities.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {venueAmenities.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 bg-[#F5F4FA] rounded-xl border border-[#E4E0F0]">
                    <Check size={13} className="text-[#3EC9C1] shrink-0" />
                    <span className="text-sm text-[#1A1530]">{a}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Travel Detail */}
        {content.travelDetailDescription && (
          <section>
            <h2 className="text-xl font-bold text-[#1A1530] mb-4">Travel Detail</h2>
            <p className="text-[#6B6882] leading-relaxed">{content.travelDetailDescription}</p>
          </section>
        )}

        {/* Inclusions */}
        {(includedItems.length > 0 || notIncludedItems.length > 0) && (
          <section>
            <h2 className="text-xl font-bold text-[#1A1530] mb-4">Package Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {includedItems.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-[#9E9BAC] mb-3 uppercase tracking-wider">
                    Included
                  </h3>
                  <ul className="space-y-2">
                    {includedItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-[#1A1530]">
                        <Check size={15} className="text-[#3EC9C1] shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {notIncludedItems.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-[#9E9BAC] mb-3 uppercase tracking-wider">
                    Not Included
                  </h3>
                  <ul className="space-y-2">
                    {notIncludedItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-[#9E9BAC]">
                        <X size={15} className="text-[#D0CCDF] shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Travel Program */}
        {travelProgram.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#1A1530] mb-4">Travel Program</h2>
            <div className="space-y-2">
              {travelProgram.map((day, i) => (
                <div key={i} className="border border-[#E4E0F0] rounded-2xl overflow-hidden">
                  <button
                    className="w-full flex items-center gap-3 p-4 hover:bg-[#F5F2FF] transition-colors text-left"
                    onClick={() => toggleDay(i)}
                  >
                    <span className="w-8 h-8 bg-[#3A2895] text-white rounded-xl flex items-center justify-center text-sm font-bold shrink-0">
                      {day.day}
                    </span>
                    <span className="font-semibold text-[#1A1530] flex-1">{day.title}</span>
                    {expandedDays.has(i)
                      ? <ChevronUp size={16} className="text-[#9E9BAC]" />
                      : <ChevronDown size={16} className="text-[#9E9BAC]" />
                    }
                  </button>
                  {expandedDays.has(i) && day.activities.length > 0 && (
                    <div className="px-4 pb-4 border-t border-[#F0EDF8] pt-3 space-y-2">
                      {day.activities.map((act, j) => (
                        <div key={j} className="flex gap-3 text-sm">
                          <span className="text-[#9E9BAC] w-24 shrink-0 font-mono text-xs pt-0.5">
                            {act.time}
                          </span>
                          <span className="text-[#6B6882]">{act.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Accommodation */}
        {(content.hotelName || content.hotelDescription) && (
          <section>
            <h2 className="text-xl font-bold text-[#1A1530] mb-4">Where You Will Stay</h2>
            <div className="border border-[#E4E0F0] rounded-2xl p-5">
              <div className="mb-3">
                <h3 className="font-semibold text-[#1A1530]">{content.hotelName}</h3>
                {stars.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {stars.map((s) => (
                      <Star key={s} size={13} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                )}
              </div>
              {content.hotelDescription && (
                <p className="text-[#6B6882] text-sm leading-relaxed mb-4">
                  {content.hotelDescription}
                </p>
              )}
              {hotelAmenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {hotelAmenities.map((a, i) => (
                    <span key={i} className="px-2.5 py-1 bg-[#EEE9FF] text-[#3A2895] text-xs rounded-full font-medium">
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Cancellation */}
        {cancellationPolicy.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#1A1530] mb-4">Cancellation Policy</h2>
            <div className="space-y-2">
              {cancellationPolicy.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#F5F4FA] rounded-xl border border-[#E4E0F0]">
                  <span className="text-sm text-[#6B6882]">{item.condition}</span>
                  <span className="text-sm font-semibold text-[#1A1530]">{item.refund}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Partner */}
        {(content.partnerName || content.partnerDescription) && (
          <section>
            <h2 className="text-xl font-bold text-[#1A1530] mb-4">Partner</h2>
            <div className="border border-[#E4E0F0] rounded-2xl p-5">
              {content.partnerName && (
                <h3 className="font-semibold text-[#1A1530] mb-2">{content.partnerName}</h3>
              )}
              {content.partnerDescription && (
                <p className="text-[#6B6882] text-sm leading-relaxed">{content.partnerDescription}</p>
              )}
            </div>
          </section>
        )}

        {/* Useful Info */}
        {content.usefulInformation && (
          <section>
            <h2 className="text-xl font-bold text-[#1A1530] mb-4">Useful Information</h2>
            <div className="bg-[#EEE9FF] border border-[#3A2895]/10 rounded-2xl p-5">
              <p className="text-[#1A1530] text-sm leading-relaxed">{content.usefulInformation}</p>
            </div>
          </section>
        )}

        {/* SEO Fields (internal) */}
        {(content.metaTitle || content.metaDescription || content.slug) && (
          <section className="border-t border-dashed border-[#E4E0F0] pt-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-[#1A1530]">SEO Fields</h2>
              <Badge variant="secondary">Internal</Badge>
            </div>
            <div className="bg-[#F5F4FA] rounded-2xl p-4 space-y-3 text-sm border border-[#E4E0F0]">
              {content.metaTitle && (
                <div>
                  <span className="text-[10px] font-bold text-[#9E9BAC] uppercase tracking-wider">
                    Meta Title
                  </span>
                  <p className="text-[#1A1530] mt-0.5">{content.metaTitle}</p>
                </div>
              )}
              {content.metaDescription && (
                <div>
                  <span className="text-[10px] font-bold text-[#9E9BAC] uppercase tracking-wider">
                    Meta Description
                  </span>
                  <p className="text-[#6B6882] mt-0.5">{content.metaDescription}</p>
                </div>
              )}
              {content.slug && (
                <div>
                  <span className="text-[10px] font-bold text-[#9E9BAC] uppercase tracking-wider">
                    URL Slug
                  </span>
                  <p className="text-[#3A2895] mt-0.5 font-mono">/en/{content.slug}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
