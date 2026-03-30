import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { parsePDF, parseDOCX } from "@/lib/document-parser"
import { uploadBriefPDF } from "@/lib/gcs"

const GCS_BUCKET = process.env.GCS_BUCKET_NAME ?? ""
const GCS_ENABLED = !!GCS_BUCKET && GCS_BUCKET !== "your-gcs-bucket-name"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 })
  }

  const buffer   = Buffer.from(await file.arrayBuffer())
  const filename = file.name
  const ext      = filename.split(".").pop()?.toLowerCase() ?? ""

  let text = ""
  try {
    if (ext === "pdf") {
      text = await parsePDF(buffer)
    } else if (["docx", "doc"].includes(ext)) {
      text = await parseDOCX(buffer)
    } else {
      return NextResponse.json({ error: "Unsupported file type (PDF or DOCX only)" }, { status: 400 })
    }
  } catch (parseErr) {
    const msg = parseErr instanceof Error ? parseErr.message : "Failed to parse document"
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  // Upload to GCS — skipped in local dev (bucket name is placeholder or unset)
  let briefPdfUrl: string | null = null
  if (GCS_ENABLED) {
    try {
      briefPdfUrl = await uploadBriefPDF(buffer, filename)
    } catch (err) {
      console.warn("GCS upload failed (non-fatal):", err)
    }
  }

  return NextResponse.json({ text, briefPdfUrl })
}
