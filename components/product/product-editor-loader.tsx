"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { getProduct } from "@/lib/api-client"
import type { Product } from "@/lib/types"
import { ProductEditor } from "./product-editor"

export function ProductEditorLoader({ id }: { id: string }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loaded,  setLoaded]  = useState(false)
  const [error,   setError]   = useState("")

  useEffect(() => {
    getProduct(id)
      .then((p) => {
        if (!p || p.isDeleted) { router.replace("/dashboard"); return }
        setProduct(p)
        setLoaded(true)
      })
      .catch(() => { setError("Failed to load product"); setLoaded(true) })
  }, [id, router])

  if (!loaded) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 size={24} className="animate-spin text-[#3A2895]/40" />
    </div>
  )

  if (error || !product) return (
    <div className="flex items-center justify-center h-full text-[#9E9BAC] text-sm">{error || "Product not found"}</div>
  )

  return <ProductEditor product={product} onUpdate={setProduct} />
}
