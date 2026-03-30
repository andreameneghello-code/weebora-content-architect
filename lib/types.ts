import type { ProductContentData } from "./gemini"

export type ProductStatus   = "DRAFT" | "GENERATING" | "GENERATED" | "CURATED"
export type ProductCategory = "ACADEMY" | "HOLIDAY" | "TOURNAMENT" | "GROUP_TRIP"
export type Language        = "EN" | "IT" | "ES" | "FR"

export interface ProgramProfile {
  technique: number   // 0-100
  tactics:   number   // 0-100
  play:      number   // 0-100
  balance:   number   // 0-100  (0 = pure padel, 100 = pure relax)
}

/** Shape stored in Firestore and exchanged over the API (Timestamps serialised as ISO strings). */
export interface Product {
  id:          string
  category:    ProductCategory
  status:      ProductStatus

  // Top-level metadata (mirrors EN content, kept denormalised for list queries)
  title:    string
  location: string
  country:  string

  // Short marketing copy per language (max 65 chars each)
  shortDescriptions: Partial<Record<Language, string>>

  // Program profile — product-level, language-independent
  programProfile: ProgramProfile

  // AI-generated multilingual content
  contents: Partial<Record<Language, ProductContentData>>

  // Brief reference
  briefPdfUrl: string | null
  briefText:   string | null

  // Soft delete
  isDeleted:  boolean
  deletedAt:  string | null   // ISO string | null

  // Audit
  createdAt:  string          // ISO string
  updatedAt:  string          // ISO string
  createdBy:  string          // email
}

/** Backwards-compat alias for components that still import from local-storage */
export type LocalProduct = Product
