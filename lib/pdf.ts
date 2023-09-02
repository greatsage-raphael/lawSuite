import pdfParse from "pdf-parse"

export const getTextContentFromPDF = async (pdfBuffer: Buffer) => {
  // TODO: pass metadata
  const { text } = await pdfParse(pdfBuffer)
  return text
}
