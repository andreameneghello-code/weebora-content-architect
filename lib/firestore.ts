import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { randomUUID } from "crypto"
import type { Product, ProductCategory, ProductStatus, Language, ProgramProfile } from "./types"
import type { ProductContentData } from "./gemini"

// ── Environment detection ─────────────────────────────────────────────────────
// When GCP_PROJECT_ID is absent or still the placeholder, fall back to a local
// JSON file store so the app works out-of-the-box without any GCP credentials.

const GCP_PROJECT  = process.env.GCP_PROJECT_ID ?? ""
const IS_LOCAL_DEV = !GCP_PROJECT || GCP_PROJECT === "your-gcp-project-id"

if (IS_LOCAL_DEV) {
  console.info("[db] GCP not configured — using local JSON store at .data/products.json")
}

// ── Firestore singleton (production) ─────────────────────────────────────────

// Lazily import so the module never crashes when Firestore is unused.
type FSType = import("@google-cloud/firestore").Firestore
type FVType = typeof import("@google-cloud/firestore").FieldValue
type TSType = typeof import("@google-cloud/firestore").Timestamp

let _db:  FSType  | null = null
let _FV:  FVType  | null = null
let _TS:  TSType  | null = null

function db(): FSType {
  if (!_db) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("@google-cloud/firestore") as typeof import("@google-cloud/firestore")
    _FV = mod.FieldValue
    _TS = mod.Timestamp
    _db = new mod.Firestore({ projectId: GCP_PROJECT })
  }
  return _db
}
function FV(): FVType { db(); return _FV! }

// ── Serialisation helpers (Firestore) ─────────────────────────────────────────

function toProduct(id: string, data: FirebaseFirestore.DocumentData): Product {
  const TS = _TS
  const toISO = (v: unknown): string => {
    if (!v) return new Date().toISOString()
    if (TS && v instanceof TS) return (v as InstanceType<TSType>).toDate().toISOString()
    return String(v)
  }
  return {
    id,
    category:          data.category          ?? "HOLIDAY",
    status:            data.status            ?? "DRAFT",
    title:             data.title             ?? "",
    location:          data.location          ?? "",
    country:           data.country           ?? "",
    shortDescriptions: data.shortDescriptions ?? {},
    programProfile:    data.programProfile    ?? { technique: 50, tactics: 50, play: 50, balance: 50 },
    contents:          data.contents          ?? {},
    briefPdfUrl:       data.briefPdfUrl       ?? null,
    briefText:         data.briefText         ?? null,
    isDeleted:         data.isDeleted         ?? false,
    deletedAt:         data.deletedAt ? toISO(data.deletedAt) : null,
    createdAt:         toISO(data.createdAt),
    updatedAt:         toISO(data.updatedAt),
    createdBy:         data.createdBy         ?? "",
  }
}

// ── Local JSON store (development) ────────────────────────────────────────────

const DATA_DIR  = join(process.cwd(), ".data")
const DATA_FILE = join(DATA_DIR, "products.json")

function localRead(): Product[] {
  if (!existsSync(DATA_DIR))  mkdirSync(DATA_DIR, { recursive: true })
  if (!existsSync(DATA_FILE)) writeFileSync(DATA_FILE, "[]", "utf-8")
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf-8")) as Product[]
  } catch {
    return []
  }
}

function localWrite(products: Product[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), "utf-8")
}

function now(): string { return new Date().toISOString() }

// ── Queries ───────────────────────────────────────────────────────────────────

export async function listProducts(opts?: {
  category?: ProductCategory
  status?:   ProductStatus
}): Promise<Product[]> {
  if (IS_LOCAL_DEV) {
    let all = localRead().filter((p) => !p.isDeleted)
    if (opts?.category) all = all.filter((p) => p.category === opts.category)
    if (opts?.status)   all = all.filter((p) => p.status   === opts.status)
    return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }
  const COL = "products"
  let q = db().collection(COL).where("isDeleted", "==", false) as FirebaseFirestore.Query
  if (opts?.category) q = q.where("category", "==", opts.category)
  if (opts?.status)   q = q.where("status",   "==", opts.status)
  q = q.orderBy("updatedAt", "desc")
  const snap = await q.get()
  return snap.docs.map((d) => toProduct(d.id, d.data()))
}

export async function listTrash(): Promise<Product[]> {
  if (IS_LOCAL_DEV) {
    return localRead()
      .filter((p) => p.isDeleted)
      .sort((a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? ""))
  }
  const COL = "products"
  const snap = await db()
    .collection(COL)
    .where("isDeleted", "==", true)
    .orderBy("deletedAt", "desc")
    .get()
  return snap.docs.map((d) => toProduct(d.id, d.data()))
}

export async function getProduct(id: string): Promise<Product | null> {
  if (IS_LOCAL_DEV) {
    return localRead().find((p) => p.id === id) ?? null
  }
  const COL = "products"
  const doc = await db().collection(COL).doc(id).get()
  if (!doc.exists) return null
  return toProduct(doc.id, doc.data()!)
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createProduct(payload: {
  category:    ProductCategory
  briefText:   string
  briefPdfUrl: string | null
  createdBy:   string
}): Promise<Product> {
  if (IS_LOCAL_DEV) {
    const product: Product = {
      id:                randomUUID(),
      category:          payload.category,
      status:            "DRAFT",
      title:             "",
      location:          "",
      country:           "",
      shortDescriptions: {},
      programProfile:    { technique: 50, tactics: 50, play: 50, balance: 50 },
      contents:          {},
      briefPdfUrl:       payload.briefPdfUrl,
      briefText:         payload.briefText,
      isDeleted:         false,
      deletedAt:         null,
      createdAt:         now(),
      updatedAt:         now(),
      createdBy:         payload.createdBy,
    }
    const all = localRead()
    all.push(product)
    localWrite(all)
    return product
  }
  const COL = "products"
  const ref  = db().collection(COL).doc()
  const ts   = FV().serverTimestamp()
  await ref.set({
    category:          payload.category,
    status:            "DRAFT" as ProductStatus,
    title:             "",
    location:          "",
    country:           "",
    shortDescriptions: {},
    programProfile:    { technique: 50, tactics: 50, play: 50, balance: 50 },
    contents:          {},
    briefPdfUrl:       payload.briefPdfUrl,
    briefText:         payload.briefText,
    isDeleted:         false,
    deletedAt:         null,
    createdAt:         ts,
    updatedAt:         ts,
    createdBy:         payload.createdBy,
  })
  const snap = await ref.get()
  return toProduct(ref.id, snap.data()!)
}

export async function updateProductStatus(
  id:     string,
  status: ProductStatus
): Promise<void> {
  if (IS_LOCAL_DEV) {
    const all = localRead()
    const idx = all.findIndex((p) => p.id === id)
    if (idx !== -1) { all[idx].status = status; all[idx].updatedAt = now() }
    localWrite(all)
    return
  }
  const COL = "products"
  await db().collection(COL).doc(id).update({ status, updatedAt: FV().serverTimestamp() })
}

export async function setAllLanguageContents(
  id:          string,
  allContents: Record<string, ProductContentData>
): Promise<Product> {
  const en = allContents.EN ?? {}
  if (IS_LOCAL_DEV) {
    const all = localRead()
    const idx = all.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error(`Product ${id} not found`)
    all[idx] = {
      ...all[idx],
      contents:  allContents as Record<string, unknown> as Product["contents"],
      status:    "GENERATED",
      title:     (en as Partial<ProductContentData>).title    ?? all[idx].title,
      location:  (en as Partial<ProductContentData>).location ?? all[idx].location,
      country:   (en as Partial<ProductContentData>).country  ?? all[idx].country,
      updatedAt: now(),
    }
    localWrite(all)
    return all[idx]
  }
  const COL = "products"
  await db().collection(COL).doc(id).update({
    contents:  allContents,
    status:    "GENERATED" as ProductStatus,
    title:     (en as Partial<ProductContentData>).title    ?? "",
    location:  (en as Partial<ProductContentData>).location ?? "",
    country:   (en as Partial<ProductContentData>).country  ?? "",
    updatedAt: FV().serverTimestamp(),
  })
  const snap = await db().collection(COL).doc(id).get()
  return toProduct(snap.id, snap.data()!)
}

export async function updateProductContent(
  id:       string,
  language: Language,
  content:  Partial<ProductContentData>
): Promise<Product> {
  if (IS_LOCAL_DEV) {
    const all = localRead()
    const idx = all.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error(`Product ${id} not found`)
    const existing = ((all[idx].contents as Record<string, unknown>)?.[language] ?? {}) as Partial<ProductContentData>
    const merged   = { ...existing, ...content }
    const contents = { ...(all[idx].contents as Record<string, unknown>), [language]: merged }
    const updates: Partial<Product> = { contents: contents as Product["contents"], updatedAt: now() }
    if (all[idx].status === "GENERATED") updates.status = "CURATED"
    if (language === "EN") {
      if (merged.title)    updates.title    = merged.title
      if (merged.location) updates.location = merged.location
      if (merged.country)  updates.country  = merged.country
    }
    all[idx] = { ...all[idx], ...updates }
    localWrite(all)
    return all[idx]
  }
  const COL = "products"
  const doc  = await db().collection(COL).doc(id).get()
  if (!doc.exists) throw new Error(`Product ${id} not found`)
  const data     = doc.data()!
  const existing = (data.contents?.[language] ?? {}) as Partial<ProductContentData>
  const merged   = { ...existing, ...content }
  const updates: Record<string, unknown> = {
    [`contents.${language}`]: merged,
    updatedAt: FV().serverTimestamp(),
  }
  if (data.status === "GENERATED") updates.status = "CURATED"
  if (language === "EN") {
    if (merged.title)    updates.title    = merged.title
    if (merged.location) updates.location = merged.location
    if (merged.country)  updates.country  = merged.country
  }
  await db().collection(COL).doc(id).update(updates)
  const snap = await db().collection(COL).doc(id).get()
  return toProduct(snap.id, snap.data()!)
}

export async function updateProgramProfile(
  id:      string,
  profile: Partial<ProgramProfile>
): Promise<Product> {
  if (IS_LOCAL_DEV) {
    const all = localRead()
    const idx = all.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error(`Product ${id} not found`)
    all[idx].programProfile = { ...all[idx].programProfile, ...profile }
    all[idx].updatedAt      = now()
    localWrite(all)
    return all[idx]
  }
  const COL = "products"
  const doc = await db().collection(COL).doc(id).get()
  if (!doc.exists) throw new Error(`Product ${id} not found`)
  const existing = (doc.data()!.programProfile ?? {}) as ProgramProfile
  await db().collection(COL).doc(id).update({
    programProfile: { ...existing, ...profile },
    updatedAt:      FV().serverTimestamp(),
  })
  const snap = await db().collection(COL).doc(id).get()
  return toProduct(snap.id, snap.data()!)
}

export async function updateShortDescriptions(
  id:     string,
  shorts: Partial<Record<Language, string>>
): Promise<Product> {
  if (IS_LOCAL_DEV) {
    const all = localRead()
    const idx = all.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error(`Product ${id} not found`)
    all[idx].shortDescriptions = { ...all[idx].shortDescriptions, ...shorts }
    all[idx].updatedAt         = now()
    localWrite(all)
    return all[idx]
  }
  const COL = "products"
  const doc = await db().collection(COL).doc(id).get()
  if (!doc.exists) throw new Error(`Product ${id} not found`)
  const existing = (doc.data()!.shortDescriptions ?? {}) as Record<Language, string>
  await db().collection(COL).doc(id).update({
    shortDescriptions: { ...existing, ...shorts },
    updatedAt:         FV().serverTimestamp(),
  })
  const snap = await db().collection(COL).doc(id).get()
  return toProduct(snap.id, snap.data()!)
}

// ── Soft delete ───────────────────────────────────────────────────────────────

export async function softDeleteProduct(id: string): Promise<void> {
  if (IS_LOCAL_DEV) {
    const all = localRead()
    const idx = all.findIndex((p) => p.id === id)
    if (idx !== -1) {
      all[idx].isDeleted = true
      all[idx].deletedAt = now()
      all[idx].updatedAt = now()
    }
    localWrite(all)
    return
  }
  const COL = "products"
  await db().collection(COL).doc(id).update({
    isDeleted: true,
    deletedAt: FV().serverTimestamp(),
    updatedAt: FV().serverTimestamp(),
  })
}

export async function restoreProduct(id: string): Promise<void> {
  if (IS_LOCAL_DEV) {
    const all = localRead()
    const idx = all.findIndex((p) => p.id === id)
    if (idx !== -1) {
      all[idx].isDeleted = false
      all[idx].deletedAt = null
      all[idx].updatedAt = now()
    }
    localWrite(all)
    return
  }
  const COL = "products"
  await db().collection(COL).doc(id).update({
    isDeleted: false,
    deletedAt: null,
    updatedAt: FV().serverTimestamp(),
  })
}

export async function permanentDeleteProduct(id: string): Promise<void> {
  if (IS_LOCAL_DEV) {
    const all = localRead().filter((p) => p.id !== id)
    localWrite(all)
    return
  }
  const COL = "products"
  await db().collection(COL).doc(id).delete()
}
