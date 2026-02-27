import Anthropic from "@anthropic-ai/sdk"
import { jsonrepair } from "jsonrepair"
import { TONE_OF_VOICE_GUIDELINES } from "./tone-of-voice"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL = "claude-sonnet-4-5-20250929"

export interface ProductContentData {
  // Hero
  title: string
  subtitle: string
  location: string
  country: string
  duration: string
  priceFrom: string
  difficultyLevel: string
  highlights: string[]

  // The Experience (single field, ≤600 chars)
  experienceShort: string

  // Venue
  venueName: string
  venueLocation: string
  venueDescription: string
  venueAmenities: string[]

  // Travel Detail
  travelDetailDescription: string

  // Inclusions
  includedItems: string[]
  notIncludedItems: string[]

  // Travel Program
  travelProgram: Array<{
    day: number
    title: string
    activities: Array<{
      time: string
      description: string
    }>
  }>

  // Accommodation
  hotelName: string
  hotelStars: number
  hotelDescription: string
  hotelAmenities: string[]

  // Cancellation Policy
  cancellationPolicy: Array<{
    condition: string
    refund: string
  }>

  // Partner
  partnerName: string
  partnerDescription: string

  // Useful Information
  usefulInformation: string

  // SEO
  metaTitle: string
  metaDescription: string
  slug: string

  // Padel / Relax balance (0 = full Padel, 100 = full Relax)
  balanceScore?: number

  // Program Profile – skill ratings (1–5) and intensity (0 = Relax, 100 = full Padel)
  profileTechnique?: number
  profileTactics?: number
  profilePlay?: number
  profileIntensity?: number
}

const CONTENT_SCHEMA = `{
  "title": "string — H1. Primary keyword in first 3 words. Category formula. 55–65 chars. Title case. Benefit-driven.",
  "subtitle": "string — Secondary/location keyword. 70–110 chars. Reinforce USP. Emotional signal at end.",
  "location": "string — city name only",
  "country": "string — country name only",
  "duration": "string (e.g. '5 days')",
  "priceFrom": "string (e.g. '€499')",
  "difficultyLevel": "string (e.g. 'All levels' / 'Intermediate & Advanced')",
  "highlights": [
    "string — benefit bullet, ≤12 words, starts with number or verb, contains keyword or specific detail",
    "string — benefit bullet, ≤12 words, starts with number or verb, contains keyword or specific detail",
    "string — benefit bullet, ≤12 words, starts with number or verb, contains keyword or specific detail",
    "string — benefit bullet, ≤12 words, starts with number or verb, contains keyword or specific detail"
  ],
  "experienceShort": "string — 400–600 chars. Opens with primary keyword or location. 1–2% keyword density. Covers: location + activity type + coach credential + USP. No generic phrases.",
  "venueName": "string — exact venue/club name",
  "venueLocation": "string — city, country",
  "venueDescription": "string — venue name + city + 'padel courts' in first sentence. Court surface, count, unique feature. 100–200 chars.",
  "venueAmenities": ["string — specific amenity"],
  "travelDetailDescription": "string — practical travel info including transport keywords relevant to destination.",
  "includedItems": ["string — concrete benefit phrasing, not generic"],
  "notIncludedItems": ["string"],
  "travelProgram": [{"day": 1, "title": "string — keyword-rich day title", "activities": [{"time": "string", "description": "string"}]}],
  "hotelName": "string — exact hotel name",
  "hotelStars": 4,
  "hotelDescription": "string — hotel name + star rating + city in first sentence. 'padel hotel [city]' framing. Amenities reinforcing padel lifestyle. 80–150 chars.",
  "hotelAmenities": ["string"],
  "cancellationPolicy": [{"condition": "string", "refund": "string"}],
  "partnerName": "string — exact academy/coach name for branded search",
  "partnerDescription": "string — certified credentials (PP/FIP level, pro circuit), methodology, unique training approach. Academy name as exact string.",
  "usefulInformation": "string — practical details: visa, climate, currency, transport. Trust-building factual language.",
  "metaTitle": "string — STRICTLY ≤60 chars. Format: [Primary Keyword] – [USP or Location] | Weebora. Primary keyword + city. No truncation.",
  "metaDescription": "string — STRICTLY ≤160 chars. Sentence 1: primary keyword + key benefit. Sentence 2: secondary detail + CTA. Include a number. Natural language.",
  "slug": "string — lowercase hyphens only, no stop words. Contains primary keyword + city. ≤60 chars. E.g. 'padel-academy-madrid-5-days'."
}`

async function askClaude(prompt: string): Promise<string> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system:
      "You are a JSON API. Respond with a single valid JSON object only. " +
      "Do NOT use markdown. Do NOT wrap in code fences. " +
      "Do NOT add any text before or after the JSON. " +
      "The response MUST start with '{' and end with '}'. " +
      "Escape all special characters inside string values properly.",
    messages: [{ role: "user", content: prompt }],
  })

  if (message.stop_reason === "max_tokens") {
    throw new Error(
      "Response was cut off — the brief may be too long. Try a shorter document."
    )
  }

  const block = message.content[0]
  if (block.type !== "text") throw new Error("Unexpected response type from Claude")
  return block.text
}

function parseJSON(raw: string): ProductContentData {
  // 1. Strip markdown fences
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  const cleaned = fenceMatch ? fenceMatch[1].trim() : raw.trim()

  // 2. Extract outermost { } block
  const start = cleaned.indexOf("{")
  const end = cleaned.lastIndexOf("}")
  const jsonStr = start !== -1 && end !== -1 ? cleaned.slice(start, end + 1) : cleaned

  // 3. Try clean parse first
  try {
    return JSON.parse(jsonStr) as ProductContentData
  } catch {
    // 4. Fall back to jsonrepair
    try {
      const repaired = jsonrepair(jsonStr)
      return JSON.parse(repaired) as ProductContentData
    } catch (repairErr) {
      console.error("JSON repair also failed. Raw response snippet:", jsonStr.slice(0, 500))
      throw new Error(`Could not parse Claude response as JSON: ${repairErr}`)
    }
  }
}

async function askClaudeWithRetry(prompt: string, attempts = 3): Promise<ProductContentData> {
  for (let i = 0; i < attempts; i++) {
    try {
      const raw = await askClaude(prompt)
      return parseJSON(raw)
    } catch (err) {
      console.warn(`Attempt ${i + 1} failed:`, err instanceof Error ? err.message : err)
      if (i === attempts - 1) throw err
    }
  }
  throw new Error("All attempts exhausted")
}

export async function generateEnglishContent(
  briefText: string,
  category: string
): Promise<ProductContentData> {
  const categoryLabel =
    category === "ACADEMY"
      ? "Academy"
      : category === "HOLIDAY"
      ? "Holiday"
      : category === "TOURNAMENT"
      ? "Tournament"
      : "Group Trip"

  const categoryKeywords: Record<string, string> = {
    Academy:    "padel academy [city] / padel training camp / padel clinic / improve padel [city]",
    Holiday:    "padel holiday [city] / padel break [location] / padel retreat / padel resort",
    Tournament: "padel tournament [event] [year] / [event] tickets / WPT [city] / padel event package",
    "Group Trip": "group padel trip [city] / padel squad holiday / private padel trip / padel trip with friends",
  }

  const prompt = `You are an expert SEO content writer and padel travel specialist for Weebora. Generate fully SEO-optimised product page content for a new ${categoryLabel} product.

${TONE_OF_VOICE_GUIDELINES}

## Target Keyword Cluster for this ${categoryLabel}
${categoryKeywords[categoryLabel] ?? "padel [city] / padel trip / padel experience"}

## Product Brief
${briefText}

## Task
Generate comprehensive, SEO-optimised product page content in ENGLISH.
- Apply the "${categoryLabel}" content strategy and tone of voice
- Follow the 4-step narrative flow: Hook → Logic → Emotion → Close
- Every field must follow its per-field SEO rules as defined in the schema below

## SEO Non-Negotiables
1. metaTitle MUST be ≤60 characters — count every character before submitting
2. metaDescription MUST be ≤160 characters — count every character before submitting
3. slug MUST be lowercase-hyphens-only, contain primary keyword + city, ≤60 chars
4. title MUST have the primary keyword in the first 3 words
5. experienceShort MUST open with the primary keyword or destination name
6. highlights MUST be benefit statements (not feature lists) — start each with a number or action verb
7. partnerDescription MUST include the coach's specific certification level (PP/FIP) and methodology
8. Do NOT use vague phrases: "amazing", "unforgettable journey", "unique experience" — always be specific

Output ONLY valid JSON matching this schema:
${CONTENT_SCHEMA}

Important: Keep string values on a single line. Do not use literal newlines inside JSON strings — use \\n instead. If details are missing from the brief, use sensible SEO-friendly placeholders the content team can update.`

  return askClaudeWithRetry(prompt)
}

// ── Contextual term mapping ───────────────────────────────────────────────────
// These English words produce awkward or misleading results when translated
// literally. They are replaced in the prompt instructions AND enforced via
// a post-processing pass over all string values in the translated output.

const TERM_MAP: Record<"IT" | "ES" | "FR", Record<string, string>> = {
  IT: {
    Intimate:  "Semi-privato",
    intimate:  "semi-privato",
    Veteran:   "Esperto",
    veteran:   "esperto",
    Soul:      "Atmosfera",
    soul:      "atmosfera",
  },
  ES: {
    Intimate:  "Personalizado",
    intimate:  "personalizado",
    Veteran:   "Especialista",
    veteran:   "especialista",
    Soul:      "Esencia",
    soul:      "esencia",
  },
  FR: {
    Intimate:  "Privatisé",
    intimate:  "privatisé",
    Veteran:   "Expert",
    veteran:   "expert",
    Soul:      "Esprit",
    soul:      "esprit",
  },
}

/** Recursively apply contextual term replacements to every string value. */
function applyTermMap(data: unknown, lang: "IT" | "ES" | "FR"): unknown {
  const map = TERM_MAP[lang]
  if (typeof data === "string") {
    let result = data
    for (const [from, to] of Object.entries(map)) {
      result = result.replace(new RegExp(`\\b${from}\\b`, "g"), to)
    }
    return result
  }
  if (Array.isArray(data)) return data.map((item) => applyTermMap(item, lang))
  if (data && typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([k, v]) => [k, applyTermMap(v, lang)])
    )
  }
  return data
}

export async function translateContent(
  englishContent: ProductContentData,
  targetLanguage: "IT" | "ES" | "FR"
): Promise<ProductContentData> {
  const languageMap = { IT: "Italian", ES: "Spanish", FR: "French" }
  const langName = languageMap[targetLanguage]

  const termRules = Object.entries(TERM_MAP[targetLanguage])
    .map(([en, tgt]) => `  • "${en}" → "${tgt}"`)
    .join("\n")

  const seoKeywordsPerLang: Record<"IT" | "ES" | "FR", string> = {
    IT: "accademia padel [città] / vacanze padel / corso padel / campo padel / allenamento padel",
    ES: "academia de pádel [ciudad] / vacaciones pádel / clases pádel / campo pádel / entrenamiento pádel",
    FR: "académie padel [ville] / vacances padel / cours padel / séjour padel / stage padel",
  }

  const prompt = `You are an expert SEO translator and padel travel specialist for Weebora. Translate this product page JSON from English to ${langName}, producing fully SEO-optimised copy in ${langName}.

Translation rules:
- Keep the exact same JSON structure and all keys unchanged
- Maintain Weebora's energetic tone in ${langName}
- Keep proper nouns (place names, academy names, hotel names) unchanged

SEO localisation rules (critical):
- slug: rewrite for ${langName} search queries — use the most searched ${langName} padel keywords + destination city, lowercase hyphens only, ≤60 chars
- metaTitle: rewrite for ${langName} — STRICTLY ≤60 characters, include primary ${langName} padel keyword + city
- metaDescription: rewrite for ${langName} — STRICTLY ≤160 characters, primary keyword in sentence 1, CTA in sentence 2
- experienceShort: open with the ${langName} primary padel keyword or destination name; 400–600 chars
- highlights: translate as benefit statements, keep starting with numbers or verbs
- All other fields: natural fluent ${langName}, keyword-rich but never stuffed
- Target keyword cluster for ${langName}: ${seoKeywordsPerLang[targetLanguage]}

Contextual term replacements — use EXACTLY these (do not translate literally):
${termRules}

Keep all string values on a single line — use \\n instead of literal newlines.
Output ONLY the translated JSON, nothing else.

English content:
${JSON.stringify(englishContent)}`

  const translated = await askClaudeWithRetry(prompt)
  // Post-processing pass: catches any terms the model missed
  return applyTermMap(translated, targetLanguage) as ProductContentData
}

export async function generateAllLanguages(
  briefText: string,
  category: string
): Promise<Record<string, ProductContentData>> {
  const english = await generateEnglishContent(briefText, category)

  const [italian, spanish, french] = await Promise.all([
    translateContent(english, "IT"),
    translateContent(english, "ES"),
    translateContent(english, "FR"),
  ])

  return {
    EN: english,
    IT: italian,
    ES: spanish,
    FR: french,
  }
}
