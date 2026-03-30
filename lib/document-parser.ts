export async function parsePDF(buffer: Buffer): Promise<string> {
  // pdf-parse v2.x uses a class-based API — pass the buffer as a base64 data URL
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PDFParse } = require("pdf-parse")
  const dataUrl = `data:application/pdf;base64,${buffer.toString("base64")}`
  const parser = new PDFParse({ url: dataUrl })
  const result = await parser.getText()
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
