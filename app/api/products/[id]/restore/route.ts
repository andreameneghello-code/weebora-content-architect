import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { restoreProduct } from "@/lib/firestore"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await restoreProduct(id)
  return NextResponse.json({ ok: true })
}
