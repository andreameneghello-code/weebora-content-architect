import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  getProduct,
  updateProductContent,
  updateProgramProfile,
  updateShortDescriptions,
  softDeleteProduct,
} from "@/lib/firestore"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const product = await getProduct(id)
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(product)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id }  = await params
  const body    = await req.json()

  // Route by patch type
  if (body.programProfile) {
    const updated = await updateProgramProfile(id, body.programProfile)
    return NextResponse.json(updated)
  }

  if (body.shortDescriptions) {
    const updated = await updateShortDescriptions(id, body.shortDescriptions)
    return NextResponse.json(updated)
  }

  if (body.language && body.content) {
    const updated = await updateProductContent(id, body.language, body.content)
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: "Invalid patch payload" }, { status: 400 })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await softDeleteProduct(id)
  return NextResponse.json({ ok: true })
}
