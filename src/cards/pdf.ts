import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

// Higher than 1x so OCR has enough resolution to read small print on a scanned card.
const RENDER_SCALE = 2

/**
 * Renders each page of a PDF to its own canvas. We treat one PDF page as one
 * business card — the common shape produced by scanner apps that auto-crop a
 * batch of cards into a multi-page PDF. A single page containing several
 * photographed cards side by side is not split further.
 */
export async function renderPdfPagesToCanvases(file: File): Promise<HTMLCanvasElement[]> {
  const data = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data }).promise
  const canvases: HTMLCanvasElement[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: RENDER_SCALE })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height

    const canvasContext = canvas.getContext('2d')
    if (!canvasContext) throw new Error('canvas context を取得できませんでした')

    await page.render({ canvasContext, canvas, viewport }).promise
    canvases.push(canvas)
  }

  return canvases
}
