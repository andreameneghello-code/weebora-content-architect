export async function parsePDF(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse")
  const result = await pdfParse(buffer)
  return result.text
}

export async function parseDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth")
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

export async function parseDocument(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
  const isPDF =
    mimeType === "application/pdf" ||
    filename.toLowerCase().endsWith(".pdf")

  const isDOCX =
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword" ||
    filename.toLowerCase().endsWith(".docx") ||
    filename.toLowerCase().endsWith(".doc")

  if (isPDF) {
    return parsePDF(buffer)
  } else if (isDOCX) {
    return parseDOCX(buffer)
  } else {
    throw new Error("Unsupported file format. Please upload a PDF or Word document.")
  }
}
