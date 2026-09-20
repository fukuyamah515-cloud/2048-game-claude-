import { createCardOcrEngine, extractCardFieldsFromImage, parseCardFields } from './ocr'
import type { BusinessCardInput } from './types'

function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

/**
 * Extracts one candidate set of card fields per "card" found in the file.
 * A plain image yields exactly one candidate. A PDF yields one candidate per
 * page, on the assumption that scanner apps save each cropped card as its own
 * page — a single page containing several photographed cards side by side is
 * not split further.
 */
export async function extractCardFieldsFromFile(
  file: File,
): Promise<Partial<BusinessCardInput>[]> {
  if (!isPdfFile(file)) {
    return [await extractCardFieldsFromImage(file)]
  }

  // pdfjs-dist is sizable and only needed for the PDF path, so it's loaded on
  // demand rather than bundled into the initial app payload.
  const { renderPdfPagesToCanvases } = await import('./pdf')

  const engine = await createCardOcrEngine()
  try {
    const pages = await renderPdfPagesToCanvases(file)
    const results: Partial<BusinessCardInput>[] = []
    for (const canvas of pages) {
      const text = await engine.recognizeBestText(canvas, canvas.width, canvas.height)
      results.push(parseCardFields(text))
    }
    return results
  } finally {
    await engine.terminate()
  }
}
