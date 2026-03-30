import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getProduct, setAllLanguageContents, updateProductStatus } from "@/lib/firestore"
import { generateAllLanguages } from "@/lib/gemini"

export const maxDuration = 300

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const product = await getProduct(id)
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!product.briefText) return NextResponse.json({ error: "No brief text" }, { status: 400 })

  await updateProductStatus(id, "GENERATING")

  try {
    const allContent = await generateAllLanguages(product.briefText, product.category)
    const updated    = await setAllLanguageContents(id, allContent)
    return NextResponse.json(updated)
  } catch (err) {
    await updateProductStatus(id, "DRAFT")
    const message = err instanceof Error ? err.message : "Generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
