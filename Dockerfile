# syntax=docker/dockerfile:1

# ── Stage 1: deps ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# ── Stage 2: builder ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env stubs (real values injected at runtime via Cloud Run env vars)
ENV NEXTAUTH_URL=http://localhost:3000 \
    NEXTAUTH_SECRET=build-secret-placeholder \
    ANTHROPIC_API_KEY=build-placeholder \
    GCP_PROJECT_ID=build-placeholder \
    GCS_BUCKET_NAME=build-placeholder \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Stage 3: runner ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Leverage Next.js standalone output (see next.config.ts output: 'standalone')
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080
ENV PORT=8080 \
    HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
