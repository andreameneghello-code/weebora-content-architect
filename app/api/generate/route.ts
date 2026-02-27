import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { generateAllLanguages } from "@/lib/gemini"

// Allow up to 300 seconds for Claude to generate content in 4 languages
export const maxDuration = 300

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { briefText, category } = await req.json()

    if (!briefText || !category) {
      return NextResponse.json({ error: "briefText and category are required" }, { status: 400 })
    }

    const allContent = await generateAllLanguages(briefText, category)

    return NextResponse.json({ content: allContent })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed"
    console.error("Generation error:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
