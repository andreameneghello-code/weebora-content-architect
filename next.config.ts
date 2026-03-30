import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "pdf-parse",
    "mammoth",
    "@google-cloud/firestore",
    "@google-cloud/storage",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
  },
  // Cloud Run sets PORT env var
  ...(process.env.PORT ? { port: parseInt(process.env.PORT) } : {}),
}

export default nextConfig
