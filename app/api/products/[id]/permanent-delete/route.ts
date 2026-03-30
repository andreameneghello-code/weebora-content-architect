import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getProduct, permanentDeleteProduct } from "@/lib/firestore"
import { deleteBriefPDF } from "@/lib/gcs"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  // Remove the PDF from GCS first (best-effort)
  const product = await getProduct(id)
  if (product?.briefPdfUrl) {
    await deleteBriefPDF(product.briefPdfUrl)
  }

  await permanentDeleteProduct(id)
  return NextResponse.json({ ok: true })
}
