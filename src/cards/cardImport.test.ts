import { beforeEach, describe, expect, it, vi } from 'vitest'
import { extractCardFieldsFromFile } from './cardImport'

const recognizeMock = vi.fn()
const terminateMock = vi.fn()
const createWorkerMock = vi.fn((..._args: unknown[]) =>
  Promise.resolve({ recognize: recognizeMock, terminate: terminateMock }),
)

vi.mock('tesseract.js', () => ({
  createWorker: (...args: unknown[]) => createWorkerMock(...args),
}))

const renderPdfPagesToCanvasesMock = vi.fn()

vi.mock('./pdf', () => ({
  renderPdfPagesToCanvases: (...args: unknown[]) => renderPdfPagesToCanvasesMock(...args),
}))

class FakeImage {
  naturalWidth = 100
  naturalHeight = 50
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  set src(_value: string) {
    queueMicrotask(() => this.onload?.())
  }
}

function makeFakeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

describe('extractCardFieldsFromFile', () => {
  beforeEach(() => {
    recognizeMock.mockReset()
    createWorkerMock.mockClear()
    terminateMock.mockClear()
    renderPdfPagesToCanvasesMock.mockReset()
    vi.stubGlobal('Image', FakeImage)
    URL.createObjectURL = vi.fn(() => 'blob:fake')
    URL.revokeObjectURL = vi.fn()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (
      this: HTMLCanvasElement,
    ) {
      return {
        translate: vi.fn(),
        rotate: vi.fn(),
        drawImage: vi.fn(),
        setTransform: vi.fn(),
        getImageData: vi.fn(() => ({
          data: new Uint8ClampedArray(this.width * this.height * 4),
        })),
        putImageData: vi.fn(),
      } as unknown as CanvasRenderingContext2D
    })
  })

  it('treats a plain image as a single candidate', async () => {
    recognizeMock.mockResolvedValue({ data: { text: '山田太郎', confidence: 90 } })
    const file = new File([''], 'card.png', { type: 'image/png' })

    const result = await extractCardFieldsFromFile(file)

    expect(result).toHaveLength(1)
    expect(result[0].company).toBe('山田太郎')
    expect(renderPdfPagesToCanvasesMock).not.toHaveBeenCalled()
  })

  it('produces one candidate per PDF page', async () => {
    renderPdfPagesToCanvasesMock.mockResolvedValue([
      makeFakeCanvas(200, 100),
      makeFakeCanvas(200, 100),
      makeFakeCanvas(200, 100),
    ])
    recognizeMock
      .mockResolvedValue({ data: { text: 'fallback', confidence: 1 } })
      .mockResolvedValueOnce({ data: { text: '山田太郎', confidence: 90 } })

    const file = new File([''], 'cards.pdf', { type: 'application/pdf' })
    const result = await extractCardFieldsFromFile(file)

    expect(result).toHaveLength(3)
    expect(renderPdfPagesToCanvasesMock).toHaveBeenCalledWith(file)
    // one OCR engine (2 language workers) reused across every page, not recreated per page
    expect(createWorkerMock).toHaveBeenCalledTimes(2)
    expect(terminateMock).toHaveBeenCalledTimes(2)
  })

  it('detects a PDF by filename when the MIME type is missing', async () => {
    renderPdfPagesToCanvasesMock.mockResolvedValue([makeFakeCanvas(200, 100)])
    recognizeMock.mockResolvedValue({ data: { text: '', confidence: 0 } })

    const file = new File([''], 'cards.PDF', { type: '' })
    await extractCardFieldsFromFile(file)

    expect(renderPdfPagesToCanvasesMock).toHaveBeenCalledWith(file)
  })
})
