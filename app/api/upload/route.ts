import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { parseDocument } from "@/lib/document-parser"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const text = await parseDocument(buffer, file.type, file.name)

    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: "Could not extract enough text from the document." }, { status: 400 })
    }

    return NextResponse.json({ text: text.trim() })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse document"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
