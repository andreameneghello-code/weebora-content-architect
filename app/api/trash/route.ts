import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { listTrash } from "@/lib/firestore"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const products = await listTrash()
  return NextResponse.json(products)
}
