import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { translateContent } from "@/lib/gemini"

// Haiku is fast — 60 s is generous
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { englishContent, targetLanguage } = await req.json()

    if (!englishContent || !targetLanguage) {
      return NextResponse.json(
        { error: "englishContent and targetLanguage are required" },
        { status: 400 }
      )
    }

    if (!["IT", "ES", "FR"].includes(targetLanguage)) {
      return NextResponse.json(
        { error: "targetLanguage must be IT, ES or FR" },
        { status: 400 }
      )
    }

    const content = await translateContent(englishContent, targetLanguage as "IT" | "ES" | "FR")
    return NextResponse.json({ content })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Translation failed"
    console.error("Translation error:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
