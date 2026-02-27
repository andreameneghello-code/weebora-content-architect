# Weebora Content Architect

Internal platform for Weebora's content team to generate and manage multilingual product page content using AI.

## Features

- **Google Auth** – Login restricted to `@weebora.com` accounts only
- **Brief Upload** – Upload PDF or Word document product briefs
- **AI Generation** – Google Gemini generates all 12 product page sections following Weebora's tone of voice
- **4 Languages** – English, Italian, Spanish, French — generated and independently editable
- **Section Editor** – Edit each section per language with structured forms and rich inputs
- **Product Dashboard** – Manage all products with search, filter, edit, delete
- **Preview Mode** – Live preview of the product page in any language

## Product Page Sections Generated

1. Hero (title, subtitle, location, highlights)
2. The Experience
3. Venue / Where You Will Train
4. Travel Detail
5. What's Included / Not Included
6. Travel Program / Itinerary
7. Accommodation
8. Cancellation Policy
9. Partner
10. Useful Information
11. SEO Fields (meta title, meta description, slug)

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** + custom UI components
- **NextAuth.js v5** (beta) with Google OAuth
- **Prisma 5** + PostgreSQL (Supabase)
- **Google Gemini AI** (`gemini-2.5-pro-preview-03-25`)
- **pdf-parse** + **mammoth** for document parsing

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` – Supabase PostgreSQL pooler URL (port 6543)
- `DIRECT_URL` – Supabase PostgreSQL direct URL (port 5432)
- `NEXTAUTH_SECRET` – Random secret: `openssl rand -base64 32`
- `NEXTAUTH_URL` – Your app URL (e.g. `http://localhost:3000`)
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` – From Google Cloud Console
- `GOOGLE_GENERATIVE_AI_API_KEY` – From Google AI Studio

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API" or "Google Identity"
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

### 4. Database Setup (Supabase)

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy the database URLs from Project Settings → Database:
   - **Transaction pooler** (port 6543) → `DATABASE_URL`
   - **Direct connection** (port 5432) → `DIRECT_URL`
3. Run database migrations:

```bash
npx prisma db push
```

### 5. Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an API key
3. Add to `.env` as `GOOGLE_GENERATIVE_AI_API_KEY`

### 6. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Database Management

```bash
# Push schema to database (development)
npx prisma db push

# Open Prisma Studio (visual database browser)
npx prisma studio

# Generate migrations (production)
npx prisma migrate dev --name init
```

## Deployment

This app is ready to deploy to Vercel:

1. Push to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel project settings
4. Deploy

For the production redirect URI in Google OAuth:
`https://your-domain.com/api/auth/callback/google`
