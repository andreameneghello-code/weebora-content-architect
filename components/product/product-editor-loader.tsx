"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { getProduct, type LocalProduct } from "@/lib/local-storage"
import { ProductEditor } from "./product-editor"

export function ProductEditorLoader({ id }: { id: string }) {
  const router = useRouter()
  const [product, setProduct] = useState<LocalProduct | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const p = getProduct(id)
    if (!p) {
      router.replace("/dashboard")
      return
    }
    setProduct(p)
    setLoaded(true)
  }, [id, router])

  if (!loaded || !product) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <ProductEditor
      product={product}
      onUpdate={(updated) => setProduct(updated)}
    />
  )
}
