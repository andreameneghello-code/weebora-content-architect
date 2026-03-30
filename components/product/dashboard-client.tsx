"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  PlusCircle, Search, Filter, Edit3, Trash2, Eye,
  MapPin, Clock, Tag, Globe, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/lib/use-toast"
import { CATEGORY_LABELS } from "@/lib/tone-of-voice"
import { getProducts, deleteProduct } from "@/lib/api-client"
import type { Product } from "@/lib/types"

const STATUS_CONFIG: Record<string, { label: string; variant: "secondary" | "warning" | "success" | "default" | "outline" }> = {
  DRAFT:      { label: "Draft",         variant: "outline" },
  GENERATING: { label: "Generating…",   variant: "warning" },
  GENERATED:  { label: "Generated",     variant: "secondary" },
  CURATED:    { label: "Curated",       variant: "success" },
}

const CATEGORY_BADGE_VARIANTS: Record<string, "academy" | "holiday" | "tournament" | "group_trip"> = {
  ACADEMY:    "academy",
  HOLIDAY:    "holiday",
  TOURNAMENT: "tournament",
  GROUP_TRIP: "group_trip",
}

const CATEGORY_FILTERS = ["ALL", "ACADEMY", "HOLIDAY", "TOURNAMENT", "GROUP_TRIP"]
const STATUS_FILTERS   = ["ALL", "DRAFT", "GENERATED", "CURATED"]

export function DashboardClient() {
  const { toast } = useToast()
  const [products,      setProducts]     = useState<Product[]>([])
  const [loaded,        setLoaded]       = useState(false)
  const [error,         setError]        = useState("")
  const [search,        setSearch]       = useState("")
  const [catFilter,     setCatFilter]    = useState("ALL")
  const [statusFilter,  setStatusFilter] = useState("ALL")
  const [deleteId,      setDeleteId]     = useState<string | null>(null)
  const [deleting,      setDeleting]     = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await getProducts()
      setProducts(data)
      setLoaded(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products")
      setLoaded(true)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase()) ||
      p.country?.toLowerCase().includes(search.toLowerCase())
    return (
      matchSearch &&
      (catFilter === "ALL" || p.category === catFilter) &&
      (statusFilter === "ALL" || p.status === statusFilter)
    )
  })

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteProduct(deleteId)
      setProducts((prev) => prev.filter((p) => p.id !== deleteId))
      toast({ title: "Moved to Trash", description: "You can restore it from the Trash view." })
    } catch {
      toast({ title: "Delete failed", variant: "destructive" })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

  if (!loaded) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 size={22} className="animate-spin text-[#3A2895]/40" />
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-sm text-[#9E9BAC]">{error}</p>
    </div>
  )

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1530]">Products</h1>
          <p className="text-[#9E9BAC] text-sm mt-0.5">
            {products.length} product{products.length !== 1 ? "s" : ""} in your library
          </p>
        </div>
        <Link href="/products/new">
          <Button className="gap-2 shadow-[0_4px_12px_rgba(58,40,149,0.25)]">
            <PlusCircle size={16} />
            New Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-7">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9BAC]" />
          <Input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={13} className="text-[#9E9BAC]" />
          <div className="flex gap-1 flex-wrap">
            {CATEGORY_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setCatFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  catFilter === f
                    ? "bg-[#3A2895] text-white shadow-sm"
                    : "bg-white border border-[#E4E0F0] text-[#6B6882] hover:border-[#3A2895] hover:text-[#3A2895]"
                }`}
              >
                {f === "ALL" ? "All" : f === "GROUP_TRIP" ? "Group Trip" : CATEGORY_LABELS[f]}
              </button>
            ))}
          </div>
          <div className="w-px h-4 bg-[#E4E0F0]" />
          <div className="flex gap-1 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  statusFilter === f
                    ? "bg-[#1A1530] text-white shadow-sm"
                    : "bg-white border border-[#E4E0F0] text-[#6B6882] hover:border-[#1A1530] hover:text-[#1A1530]"
                }`}
              >
                {f === "ALL" ? "All Status" : STATUS_CONFIG[f]?.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-24">
          {products.length === 0 ? (
            <>
              <div className="w-16 h-16 bg-[#EEE9FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe size={26} className="text-[#3A2895]/40" />
              </div>
              <p className="font-semibold text-[#1A1530] mb-1">No products yet</p>
              <p className="text-sm text-[#9E9BAC] mb-6">Create your first product to get started</p>
              <Link href="/products/new">
                <Button><PlusCircle size={15} className="mr-2" />Create First Product</Button>
              </Link>
            </>
          ) : (
            <p className="text-[#9E9BAC]">No products match your filters</p>
          )}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((product) => {
          const statusCfg  = STATUS_CONFIG[product.status] ?? STATUS_CONFIG.DRAFT
          const catVariant = CATEGORY_BADGE_VARIANTS[product.category]
          const content    = product.contents.EN

          return (
            <Card key={product.id} className="hover:shadow-[0_6px_20px_rgba(58,40,149,0.1)] transition-all group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-1.5 flex-wrap">
                    <Badge variant={catVariant}>{CATEGORY_LABELS[product.category] ?? product.category}</Badge>
                    <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/products/${product.id}/edit`}>
                      <button className="p-1.5 rounded-lg hover:bg-[#EEE9FF] text-[#9E9BAC] hover:text-[#3A2895] transition-colors" title="Edit">
                        <Edit3 size={13} />
                      </button>
                    </Link>
                    <Link href={`/products/${product.id}/preview`}>
                      <button className="p-1.5 rounded-lg hover:bg-[#EEE9FF] text-[#9E9BAC] hover:text-[#3A2895] transition-colors" title="Preview">
                        <Eye size={13} />
                      </button>
                    </Link>
                    <button
                      className="p-1.5 rounded-lg hover:bg-[#FFEDED] text-[#9E9BAC] hover:text-[#D94F4F] transition-colors"
                      title="Move to Trash"
                      onClick={() => setDeleteId(product.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-[#1A1530] text-sm leading-snug mb-1 line-clamp-2">
                  {product.title || content?.title || "Untitled Product"}
                </h3>

                <div className="flex items-center gap-3 text-xs text-[#9E9BAC] mt-3 flex-wrap">
                  {(product.location || product.country) && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {[product.location, product.country].filter(Boolean).join(", ")}
                    </span>
                  )}
                  {content?.duration && (
                    <span className="flex items-center gap-1"><Clock size={11} />{content.duration}</span>
                  )}
                  {content?.priceFrom && (
                    <span className="flex items-center gap-1 text-[#3A2895] font-semibold">
                      <Tag size={11} />from {content.priceFrom}
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#F0EDF8] flex items-center justify-between">
                  <span className="text-[11px] text-[#9E9BAC]">Updated {fmt(product.updatedAt)}</span>
                  <div className="flex gap-3">
                    <Link href={`/products/${product.id}/preview`}>
                      <button className="text-xs text-[#9E9BAC] hover:text-[#3A2895] flex items-center gap-1 transition-colors">
                        <Eye size={11} />Preview
                      </button>
                    </Link>
                    <Link href={`/products/${product.id}/edit`}>
                      <button className="text-xs text-[#3A2895] hover:text-[#2B1D78] flex items-center gap-1 font-semibold transition-colors">
                        <Edit3 size={11} />Edit
                      </button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Soft-delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to Trash?</DialogTitle>
            <DialogDescription>
              The product will be moved to Trash. You can restore it any time from the Trash view.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 size={13} className="animate-spin mr-1" /> : null}
              Move to Trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
