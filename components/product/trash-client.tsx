"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Trash2, RotateCcw, AlertTriangle, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/lib/use-toast"
import { CATEGORY_LABELS } from "@/lib/tone-of-voice"
import { getTrashProducts, restoreProduct, permanentDeleteProduct } from "@/lib/api-client"
import type { Product } from "@/lib/types"

const CATEGORY_BADGE_VARIANTS: Record<string, "academy" | "holiday" | "tournament" | "group_trip"> = {
  ACADEMY:    "academy",
  HOLIDAY:    "holiday",
  TOURNAMENT: "tournament",
  GROUP_TRIP: "group_trip",
}

export function TrashClient() {
  const { toast } = useToast()
  const [products,    setProducts]    = useState<Product[]>([])
  const [loaded,      setLoaded]      = useState(false)
  const [permDeleteId, setPermDeleteId] = useState<string | null>(null)
  const [busy,        setBusy]        = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await getTrashProducts()
      setProducts(data)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleRestore = async (id: string) => {
    setBusy(true)
    try {
      await restoreProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      toast({ title: "Restored", description: "Product is back in the dashboard." })
    } catch {
      toast({ title: "Restore failed", variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  const handlePermDelete = async () => {
    if (!permDeleteId) return
    setBusy(true)
    try {
      await permanentDeleteProduct(permDeleteId)
      setProducts((prev) => prev.filter((p) => p.id !== permDeleteId))
      toast({ title: "Permanently deleted" })
    } catch {
      toast({ title: "Delete failed", variant: "destructive" })
    } finally {
      setBusy(false)
      setPermDeleteId(null)
    }
  }

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"

  if (!loaded) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 size={22} className="animate-spin text-[#3A2895]/40" />
    </div>
  )

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#FFEDED] flex items-center justify-center">
          <Trash2 size={18} className="text-[#D94F4F]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1530]">Trash</h1>
          <p className="text-[#9E9BAC] text-sm mt-0.5">
            {products.length} deleted product{products.length !== 1 ? "s" : ""} · Restore or permanently delete
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-[#F5F4FA] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 size={26} className="text-[#D0CCDF]" />
          </div>
          <p className="font-semibold text-[#1A1530] mb-1">Trash is empty</p>
          <p className="text-sm text-[#9E9BAC]">Deleted products will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => {
            const catVariant = CATEGORY_BADGE_VARIANTS[product.category]
            const content    = product.contents.EN

            return (
              <Card key={product.id} className="border-[#E4E0F0]">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge variant={catVariant}>{CATEGORY_LABELS[product.category] ?? product.category}</Badge>
                      <span className="text-[11px] text-[#9E9BAC] flex items-center gap-1">
                        <AlertTriangle size={10} />
                        Deleted {fmt(product.deletedAt)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[#1A1530] text-sm truncate">
                      {product.title || content?.title || "Untitled Product"}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-[#9E9BAC] mt-1 flex-wrap">
                      {(product.location || product.country) && (
                        <span className="flex items-center gap-1">
                          <MapPin size={10} />
                          {[product.location, product.country].filter(Boolean).join(", ")}
                        </span>
                      )}
                      {content?.duration && (
                        <span className="flex items-center gap-1"><Clock size={10} />{content.duration}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestore(product.id)}
                      disabled={busy}
                      className="gap-1.5 text-[#3A2895] border-[#3A2895]/30 hover:bg-[#EEE9FF]"
                    >
                      <RotateCcw size={13} />
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setPermDeleteId(product.id)}
                      disabled={busy}
                      className="gap-1.5"
                    >
                      <Trash2 size={13} />
                      Delete Forever
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={!!permDeleteId} onOpenChange={(o) => !o && setPermDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently delete?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The product, all its content, and the original brief PDF will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handlePermDelete} disabled={busy}>
              {busy ? <Loader2 size={13} className="animate-spin mr-1" /> : null}
              Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
