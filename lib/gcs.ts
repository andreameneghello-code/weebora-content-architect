import { Storage } from "@google-cloud/storage"

let _storage: Storage | null = null

function storage(): Storage {
  if (!_storage) {
    _storage = new Storage({ projectId: process.env.GCP_PROJECT_ID })
  }
  return _storage
}

const BUCKET = () => process.env.GCS_BUCKET_NAME ?? ""

/**
 * Uploads a Buffer to GCS and returns the public HTTPS URL.
 * The object is stored under briefs/{timestamp}-{filename}.
 */
export async function uploadBriefPDF(
  buffer:   Buffer,
  filename: string
): Promise<string> {
  const bucket   = storage().bucket(BUCKET())
  const objName  = `briefs/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`
  const file     = bucket.file(objName)

  await file.save(buffer, {
    contentType: "application/pdf",
    metadata: { cacheControl: "private, max-age=0" },
  })

  // Return a signed URL valid for 7 days (avoids making the bucket public)
  const [url] = await file.getSignedUrl({
    action:  "read",
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  })
  return url
}

/**
 * Permanently removes an object from GCS (called on permanent product delete).
 * Silently succeeds if the object doesn't exist.
 */
export async function deleteBriefPDF(url: string): Promise<void> {
  try {
    // Extract object name from the signed URL
    const u       = new URL(url)
    const objName = decodeURIComponent(u.pathname.replace(`/${BUCKET()}/`, ""))
    await storage().bucket(BUCKET()).file(objName).delete({ ignoreNotFound: true })
  } catch {
    // Non-fatal — log and continue
    console.warn("GCS delete failed for", url)
  }
}
