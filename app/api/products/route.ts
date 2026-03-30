import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { listProducts, createProduct } from "@/lib/firestore"
import type { ProductCategory } from "@/lib/types"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category") as ProductCategory | null
  const status   = searchParams.get("status")

  const products = await listProducts({
    ...(category ? { category } : {}),
    ...(status   ? { status: status as never } : {}),
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { category, briefText, briefPdfUrl } = body

  if (!category || !briefText) {
    return NextResponse.json({ error: "category and briefText are required" }, { status: 400 })
  }

  const product = await createProduct({
    category,
    briefText,
    briefPdfUrl: briefPdfUrl ?? null,
    createdBy:   session.user.email ?? "",
  })
  return NextResponse.json(product, { status: 201 })
}
