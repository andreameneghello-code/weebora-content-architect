"use client"

import type { LocalProduct } from "@/lib/local-storage"
import type { ProductContentData } from "@/lib/gemini"
import { CATEGORY_LABELS } from "@/lib/tone-of-voice"

// ── Static SVG primitives ─────────────────────────────────────────────────────

function TennisBall({ active }: { active: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 22 22" fill="none"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
    >
      <circle cx="11" cy="11" r="10" fill={active ? "#3EC9C1" : "#E4E0F0"} />
      <path d="M4.5 7.5 C7.5 9 7.5 13 4.5 14.5"
        stroke={active ? "white" : "#C8C4D4"} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M17.5 7.5 C14.5 9 14.5 13 17.5 14.5"
        stroke={active ? "white" : "#C8C4D4"} strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function CheckCircle() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      style={{ display: "inline-block", flexShrink: 0, marginTop: 2, verticalAlign: "top" }}>
      <circle cx="7" cy="7" r="7" fill="#3A2895" />
      <path d="M3.5 7 L6 9.5 L10.5 5"
        stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CrossCircle() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      style={{ display: "inline-block", flexShrink: 0, marginTop: 2, verticalAlign: "top" }}>
      <circle cx="7" cy="7" r="7" fill="#E4E0F0" />
      <path d="M4.5 4.5 L9.5 9.5 M9.5 4.5 L4.5 9.5"
        stroke="#9E9BAC" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B"
      style={{ display: "inline-block", verticalAlign: "middle" }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
// data-pdf-section marks boundaries the export slicer uses to avoid mid-content cuts

function PdfSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div data-pdf-section="true" style={{ marginBottom: 20 }}>
      <h2 style={{
        fontSize: 9,
        fontWeight: 800,
        lineHeight: 1.2,
        color: "#3A2895",
        textTransform: "uppercase",
        letterSpacing: "0.09em",
        wordSpacing: "normal",
        margin: "0 0 7px",
        paddingBottom: 5,
        borderBottom: "1px solid #E4E0F0",
      }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

// ── Shared inline styles ──────────────────────────────────────────────────────
const FONT: React.CSSProperties = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  WebkitFontSmoothing: "antialiased",
  // Prevent html2canvas from inheriting browser-computed spacing that causes
  // vertically "spread" text in the captured canvas.
  letterSpacing: "normal",
  wordSpacing: "normal",
}
const BODY: React.CSSProperties  = { fontSize: 11, color: "#6B6882", lineHeight: 1.4, margin: 0, letterSpacing: "normal", wordSpacing: "normal" }
const BOX: React.CSSProperties   = { background: "#FAFAF9", border: "1px solid #E4E0F0", borderRadius: 10, padding: 14 }

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  product: LocalProduct
  language?: string
}

export function QuotePDF({ product, language = "EN" }: Props) {
  const lang     = (language || "EN") as keyof typeof product.contents
  const content: Partial<ProductContentData> = product.contents[lang] ?? {}

  const highlights         = (content.highlights         as string[] | undefined) ?? []
  const includedItems      = (content.includedItems      as string[] | undefined) ?? []
  const notIncludedItems   = (content.notIncludedItems   as string[] | undefined) ?? []
  const venueAmenities     = (content.venueAmenities     as string[] | undefined) ?? []
  const hotelAmenities     = (content.hotelAmenities     as string[] | undefined) ?? []
  const travelProgram      = (content.travelProgram as Array<{
    day: number; title: string
    activities: Array<{ time: string; description: string }>
  }> | undefined) ?? []
  const cancellationPolicy = (content.cancellationPolicy as Array<{
    condition: string; refund: string
  }> | undefined) ?? []
  const stars = typeof content.hotelStars === "number"
    ? Array.from({ length: content.hotelStars })
    : []

  const technique  = typeof content.profileTechnique === "number" ? content.profileTechnique : 0
  const tactics    = typeof content.profileTactics   === "number" ? content.profileTactics   : 0
  const play       = typeof content.profilePlay      === "number" ? content.profilePlay      : 0
  const intensity  = typeof content.profileIntensity === "number" ? content.profileIntensity : null
  const hasProfile = technique > 0 || tactics > 0 || play > 0 || intensity !== null

  const intensityLabel =
    intensity === null ? ""
    : intensity <= 15  ? "Pure relaxation"
    : intensity <= 35  ? "Mostly relaxed"
    : intensity <= 65  ? "Balanced"
    : intensity <= 85  ? "Mostly intensive"
    : "Max intensity"

  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  })

  return (
    <div
      id="printable-content"
      style={{
        ...FONT,
        width: 800,
        height: "auto",          // never allow flex/browser to stretch this container
        backgroundColor: "#ffffff",
        padding: "44px 52px 40px",
        boxSizing: "border-box",
        color: "#1A1530",
        fontSize: 11,            // base size for all PDF text
        lineHeight: 1.4,         // tight global default — prevents vertical spread
      }}
    >

      {/* ── HEADER ─────────────────────────────────────────────────────────
          data-pdf-section so the slicer treats header + highlights as page-1 content */}
      <div data-pdf-section="true" style={{
        marginBottom: 20,
        paddingBottom: 16,
        borderBottom: "2.5px solid #3A2895",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>

          {/* Left block */}
          <div style={{ flex: 1, marginRight: 24 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/weebora-logo.png"
              alt="Weebora"
              crossOrigin="anonymous"
              width={120}
              height={32}
              style={{ height: 28, width: "auto", objectFit: "contain", display: "block", marginBottom: 12 }}
            />
            <h1 style={{
              fontSize: 19, fontWeight: 800, color: "#1A1530",
              lineHeight: 1.2, letterSpacing: "normal", wordSpacing: "normal",
              margin: "0 0 4px",
            }}>
              {content.title || "Untitled Product"}
            </h1>
            {content.subtitle && (
              <p style={{ ...BODY, color: "#6B6882", margin: "0 0 10px" }}>
                {content.subtitle}
              </p>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              {(content.location || content.country) && (
                <span style={{ fontSize: 11, color: "#6B6882", display: "flex", alignItems: "center", gap: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3A2895" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {[content.location, content.country].filter(Boolean).join(", ")}
                </span>
              )}
              {content.duration && (
                <span style={{ fontSize: 11, color: "#6B6882", display: "flex", alignItems: "center", gap: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3A2895" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  {content.duration}
                </span>
              )}
              {content.difficultyLevel && (
                <span style={{
                  fontSize: 10, color: "#6B6882",
                  background: "#F5F4FA", border: "1px solid #E4E0F0",
                  padding: "2px 9px", borderRadius: 999,
                }}>
                  {content.difficultyLevel}
                </span>
              )}
            </div>
          </div>

          {/* Right block: price + badge */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
            {content.priceFrom && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: "#9E9BAC", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 1 }}>
                  From
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2, color: "#3A2895" }}>
                  {content.priceFrom}
                </div>
              </div>
            )}
            <span style={{
              background: "#EEE9FF", color: "#3A2895",
              fontSize: 9, fontWeight: 700,
              padding: "3px 11px", borderRadius: 999,
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              {categoryLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ── HIGHLIGHTS ─────────────────────────────────────────────────────── */}
      {highlights.length > 0 && (
        <div data-pdf-section="true" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 7,
          marginBottom: 20,
        }}>
          {highlights.map((h, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 8,
              background: "#EEE9FF", borderRadius: 9,
              padding: "7px 11px", fontSize: 11, color: "#1A1530", lineHeight: 1.4,
            }}>
              <CheckCircle />
              <span style={{ marginLeft: 1 }}>{h}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── THE EXPERIENCE ─────────────────────────────────────────────────── */}
      {content.experienceShort && (
        <PdfSection title="The Experience">
          <p style={{
            fontSize: 11,
            color: "#3A2895",
            lineHeight: 1.4,
            letterSpacing: "normal",
            wordSpacing: "normal",
            margin: 0,
            fontStyle: "italic",
          }}>
            {(content.experienceShort as string).slice(0, 600)}
          </p>
        </PdfSection>
      )}

      {/* ── PROGRAM PROFILE ────────────────────────────────────────────────── */}
      {hasProfile && (
        <PdfSection title="Program Profile">
          <div style={BOX}>
            {[
              { label: "Technique", value: technique },
              { label: "Tactics",   value: tactics },
              { label: "Play",      value: play },
            ].filter(s => s.value > 0).map((skill) => (
              <div key={skill.label} style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 9,
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#1A1530", width: 66, flexShrink: 0 }}>
                  {skill.label}
                </span>
                <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <TennisBall key={i} active={i < skill.value} />
                  ))}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "#3EC9C1",
                  background: "#E6F9F8", padding: "2px 8px", borderRadius: 999,
                  marginLeft: "auto",
                }}>
                  {skill.value}/5
                </span>
              </div>
            ))}

            {intensity !== null && (
              <div style={{ borderTop: "1px solid #F0EDF8", paddingTop: 10, marginTop: 2 }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginBottom: 6, fontSize: 10, fontWeight: 600,
                }}>
                  <span style={{ color: "#9E9BAC" }}>Relax</span>
                  <span style={{
                    background: "#E6F9F8", color: "#1FA89E",
                    padding: "2px 9px", borderRadius: 999, fontSize: 10,
                  }}>
                    {intensityLabel} — {intensity}%
                  </span>
                  <span style={{ color: "#1FA89E" }}>Padel</span>
                </div>
                {/* Solid fill bar — no gradient that can break canvas rendering */}
                <div style={{
                  height: 7, borderRadius: 999, background: "#E4E0F0", overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", width: `${intensity}%`,
                    background: "#3EC9C1", borderRadius: 999,
                  }} />
                </div>
              </div>
            )}
          </div>
        </PdfSection>
      )}

      {/* ── VENUE ──────────────────────────────────────────────────────────── */}
      {(content.venueName || content.venueDescription) && (
        <PdfSection title="Where You Will Train">
          {content.venueName && (
            <p style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2, color: "#1A1530", margin: "0 0 2px" }}>
              {content.venueName}
            </p>
          )}
          {content.venueLocation && (
            <p style={{ fontSize: 10, color: "#9E9BAC", margin: "0 0 5px" }}>{content.venueLocation}</p>
          )}
          {content.venueDescription && (
            <p style={{ ...BODY, marginBottom: 8 }}>{content.venueDescription}</p>
          )}
          {venueAmenities.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {venueAmenities.map((a, i) => (
                <span key={i} style={{
                  background: "#EEE9FF", color: "#3A2895",
                  fontSize: 10, fontWeight: 600, padding: "2px 9px", borderRadius: 999,
                }}>{a}</span>
              ))}
            </div>
          )}
        </PdfSection>
      )}

      {/* ── TRAVEL DETAIL ──────────────────────────────────────────────────── */}
      {content.travelDetailDescription && (
        <PdfSection title="Travel Detail">
          <p style={BODY}>{content.travelDetailDescription}</p>
        </PdfSection>
      )}

      {/* ── PACKAGE DETAILS ────────────────────────────────────────────────── */}
      {(includedItems.length > 0 || notIncludedItems.length > 0) && (
        <PdfSection title="Package Details">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {includedItems.length > 0 && (
              <div>
                <p style={{
                  fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.08em", color: "#9E9BAC", margin: "0 0 7px",
                }}>
                  Included
                </p>
                {includedItems.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 6,
                    fontSize: 11, color: "#1A1530", marginBottom: 5, lineHeight: 1.4,
                  }}>
                    <CheckCircle />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
            {notIncludedItems.length > 0 && (
              <div>
                <p style={{
                  fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.08em", color: "#9E9BAC", margin: "0 0 7px",
                }}>
                  Not Included
                </p>
                {notIncludedItems.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 6,
                    fontSize: 11, color: "#9E9BAC", marginBottom: 5, lineHeight: 1.4,
                  }}>
                    <CrossCircle />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PdfSection>
      )}

      {/* ── TRAVEL PROGRAM ─────────────────────────────────────────────────── */}
      {travelProgram.length > 0 && (
        <PdfSection title="Travel Program">
          {travelProgram.map((day, i) => (
            /* Each day is its own data-pdf-section so the slicer can cut between days */
            <div key={i} data-pdf-section="true" style={{
              marginBottom: 8,
              border: "1px solid #E4E0F0",
              borderRadius: 9,
              overflow: "hidden",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "7px 11px", background: "#F5F2FF",
              }}>
                <span style={{
                  background: "#3A2895", color: "white",
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, flexShrink: 0,
                }}>
                  Day {day.day}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#1A1530" }}>{day.title}</span>
              </div>
              {day.activities.length > 0 && (
                <div style={{ padding: "8px 11px", background: "white" }}>
                  {day.activities.map((act, j) => (
                    <div key={j} style={{ display: "flex", gap: 10, fontSize: 10, marginBottom: 4 }}>
                      <span style={{
                        color: "#9E9BAC", fontFamily: "monospace",
                        width: 55, flexShrink: 0, paddingTop: 1,
                      }}>
                        {act.time}
                      </span>
                      <span style={{ color: "#6B6882", lineHeight: 1.4 }}>{act.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </PdfSection>
      )}

      {/* ── ACCOMMODATION ──────────────────────────────────────────────────── */}
      {(content.hotelName || content.hotelDescription) && (
        <PdfSection title="Where You Will Stay">
          <div style={BOX}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {content.hotelName && (
                <p style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2, color: "#1A1530", margin: 0 }}>
                  {content.hotelName}
                </p>
              )}
              {stars.length > 0 && (
                <div style={{ display: "flex", gap: 2 }}>
                  {stars.map((_, i) => <StarIcon key={i} />)}
                </div>
              )}
            </div>
            {content.hotelDescription && (
              <p style={{ ...BODY, margin: "5px 0 7px" }}>{content.hotelDescription}</p>
            )}
            {hotelAmenities.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {hotelAmenities.map((a, i) => (
                  <span key={i} style={{
                    background: "#EEE9FF", color: "#3A2895",
                    fontSize: 10, fontWeight: 600, padding: "2px 9px", borderRadius: 999,
                  }}>{a}</span>
                ))}
              </div>
            )}
          </div>
        </PdfSection>
      )}

      {/* ── CANCELLATION POLICY ────────────────────────────────────────────── */}
      {cancellationPolicy.length > 0 && (
        <PdfSection title="Cancellation Policy">
          {cancellationPolicy.map((item, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "6px 11px",
              background: "#FAFAF9", border: "1px solid #E4E0F0",
              borderRadius: 7, marginBottom: 4,
            }}>
              <span style={{ fontSize: 11, color: "#6B6882" }}>{item.condition}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#1A1530" }}>{item.refund}</span>
            </div>
          ))}
        </PdfSection>
      )}

      {/* ── PARTNER ────────────────────────────────────────────────────────── */}
      {(content.partnerName || content.partnerDescription) && (
        <PdfSection title="Partner">
          <div style={BOX}>
            {content.partnerName && (
              <p style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2, color: "#1A1530", margin: "0 0 4px" }}>
                {content.partnerName}
              </p>
            )}
            {content.partnerDescription && (
              <p style={{ ...BODY }}>{content.partnerDescription}</p>
            )}
          </div>
        </PdfSection>
      )}

      {/* ── USEFUL INFORMATION ─────────────────────────────────────────────── */}
      {content.usefulInformation && (
        <PdfSection title="Useful Information">
          <div style={{
            background: "#F5F2FF", border: "1px solid rgba(58,40,149,0.15)",
            borderRadius: 10, padding: 14,
          }}>
            <p style={{ ...BODY, color: "#1A1530" }}>{content.usefulInformation}</p>
          </div>
        </PdfSection>
      )}

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <div data-pdf-section="true" style={{ marginTop: 32 }}>
        <div style={{
          height: 2,
          background: "linear-gradient(to right, #3A2895, #3EC9C1)",
          borderRadius: 999, marginBottom: 10,
        }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#9E9BAC" }}>
          <span>© {new Date().getFullYear()} Weebora · weebora.com</span>
          <span>Generated {today}</span>
          <span>Internal document — not for distribution</span>
        </div>
      </div>

    </div>
  )
}
