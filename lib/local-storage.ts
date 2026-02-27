import type { ProductContentData } from "./gemini"

export type ProductStatus = "DRAFT" | "GENERATING" | "GENERATED" | "CURATED"
export type ProductCategory = "ACADEMY" | "HOLIDAY" | "TOURNAMENT" | "GROUP_TRIP"
export type Language = "EN" | "IT" | "ES" | "FR"

export interface LocalProduct {
  id: string
  category: ProductCategory
  status: ProductStatus
  briefText?: string
  contents: Partial<Record<Language, ProductContentData>>
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "weebora_products"

function readStorage(): LocalProduct[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as LocalProduct[]) : []
  } catch {
    return []
  }
}

function writeStorage(products: LocalProduct[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}

export function getProducts(): LocalProduct[] {
  return readStorage().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export function getProduct(id: string): LocalProduct | null {
  return readStorage().find((p) => p.id === id) ?? null
}

export function createProduct(
  category: ProductCategory,
  briefText: string
): LocalProduct {
  const product: LocalProduct = {
    id: crypto.randomUUID(),
    category,
    status: "DRAFT",
    briefText,
    contents: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const products = readStorage()
  writeStorage([product, ...products])
  return product
}

export function updateProduct(
  id: string,
  updates: Partial<Omit<LocalProduct, "id" | "createdAt">>
): LocalProduct | null {
  const products = readStorage()
  const idx = products.findIndex((p) => p.id === id)
  if (idx === -1) return null
  products[idx] = { ...products[idx], ...updates, updatedAt: new Date().toISOString() }
  writeStorage(products)
  return products[idx]
}

export function updateProductContent(
  id: string,
  language: Language,
  content: Partial<ProductContentData>
): LocalProduct | null {
  const products = readStorage()
  const idx = products.findIndex((p) => p.id === id)
  if (idx === -1) return null
  const existing = products[idx].contents[language] ?? {}
  products[idx] = {
    ...products[idx],
    status: products[idx].status === "GENERATED" ? "CURATED" : products[idx].status,
    contents: {
      ...products[idx].contents,
      [language]: { ...existing, ...content } as ProductContentData,
    },
    updatedAt: new Date().toISOString(),
  }
  writeStorage(products)
  return products[idx]
}

export function setAllLanguageContents(
  id: string,
  allContents: Record<string, ProductContentData>
): LocalProduct | null {
  const products = readStorage()
  const idx = products.findIndex((p) => p.id === id)
  if (idx === -1) return null
  products[idx] = {
    ...products[idx],
    status: "GENERATED",
    contents: allContents as Record<Language, ProductContentData>,
    updatedAt: new Date().toISOString(),
  }
  writeStorage(products)
  return products[idx]
}

export function deleteProduct(id: string): void {
  writeStorage(readStorage().filter((p) => p.id !== id))
}
