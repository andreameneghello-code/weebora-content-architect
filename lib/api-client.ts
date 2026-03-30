/**
 * Client-side helpers that call the Next.js API routes.
 * Drop-in async replacements for the old local-storage functions.
 */
import type { Product, ProductCategory, Language, ProgramProfile } from "./types"
import type { ProductContentData } from "./gemini"

async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function getProducts(opts?: {
  category?: ProductCategory
  status?: string
}): Promise<Product[]> {
  const params = new URLSearchParams()
  if (opts?.category) params.set("category", opts.category)
  if (opts?.status)   params.set("status",   opts.status)
  const qs = params.toString()
  return apiFetch<Product[]>(`/api/products${qs ? `?${qs}` : ""}`)
}

export function getProduct(id: string): Promise<Product | null> {
  return apiFetch<Product>(`/api/products/${id}`).catch(() => null)
}

export function getTrashProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/api/trash")
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createProduct(
  category: ProductCategory,
  briefText: string,
  briefPdfUrl?: string | null
): Promise<Product> {
  return apiFetch<Product>("/api/products", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ category, briefText, briefPdfUrl }),
  })
}

export async function generateProductContent(id: string): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}/generate`, { method: "POST" })
}

export async function updateProductContent(
  id: string,
  language: Language,
  content: Partial<ProductContentData>
): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ language, content }),
  })
}

export async function updateProgramProfile(
  id: string,
  programProfile: Partial<ProgramProfile>
): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ programProfile }),
  })
}

export async function updateShortDescriptions(
  id: string,
  shortDescriptions: Partial<Record<Language, string>>
): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ shortDescriptions }),
  })
}

export async function deleteProduct(id: string): Promise<void> {
  await apiFetch(`/api/products/${id}`, { method: "DELETE" })
}

export async function restoreProduct(id: string): Promise<void> {
  await apiFetch(`/api/products/${id}/restore`, { method: "POST" })
}

export async function permanentDeleteProduct(id: string): Promise<void> {
  await apiFetch(`/api/products/${id}/permanent-delete`, { method: "DELETE" })
}
