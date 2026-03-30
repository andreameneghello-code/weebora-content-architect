"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { getProduct } from "@/lib/api-client"
import type { Product } from "@/lib/types"
import { ProductPreview } from "./product-preview"

export function ProductPreviewLoader({ id }: { id: string }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loaded,  setLoaded]  = useState(false)

  useEffect(() => {
    getProduct(id)
      .then((p) => {
        if (!p || p.isDeleted) { router.replace("/dashboard"); return }
        setProduct(p)
        setLoaded(true)
      })
      .catch(() => { router.replace("/dashboard") })
  }, [id, router])

  if (!loaded || !product) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 size={24} className="animate-spin text-[#3A2895]/40" />
    </div>
  )

  return <ProductPreview product={product} />
}
