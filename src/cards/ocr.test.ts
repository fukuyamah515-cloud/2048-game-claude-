import { beforeEach, describe, expect, it, vi } from 'vitest'
import { extractCardFieldsFromImage, parseCardFields } from './ocr'

const recognizeMock = vi.fn()
const terminateMock = vi.fn()
const createWorkerMock = vi.fn((..._args: unknown[]) =>
  Promise.resolve({ recognize: recognizeMock, terminate: terminateMock }),
)

vi.mock('tesseract.js', () => ({
  createWorker: (...args: unknown[]) => createWorkerMock(...args),
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

describe('parseCardFields', () => {
  it('extracts email and phone, and guesses company/name from remaining lines', () => {
    const text = '株式会社サンプル\n山田太郎\n090-1234-5678\nyamada@example.com'
    const result = parseCardFields(text)
    expect(result).toEqual({
      company: '株式会社サンプル',
      name: '山田太郎',
      phone: '090-1234-5678',
      email: 'yamada@example.com',
    })
  })

  it('ignores blank lines', () => {
    const result = parseCardFields('会社名\n\n\n氏名')
    expect(result.company).toBe('会社名')
    expect(result.name).toBe('氏名')
  })

  it('returns an empty object when nothing is recognizable', () => {
    expect(parseCardFields('')).toEqual({})
  })
})

describe('extractCardFieldsFromImage', () => {
  beforeEach(() => {
    recognizeMock.mockReset()
    createWorkerMock.mockClear()
    terminateMock.mockClear()
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

  it('loads both a horizontal and a vertical language model', async () => {
    recognizeMock.mockResolvedValue({ data: { text: '', confidence: 0 } })
    const file = new File([''], 'card.png', { type: 'image/png' })

    await extractCardFieldsFromImage(file)

    const langsUsed = createWorkerMock.mock.calls.map((call) => call[0])
    expect(langsUsed).toContain('eng+jpn')
    expect(langsUsed).toContain('jpn_vert')
  })

  it('tries every rotation for each language model and keeps the most confident result', async () => {
    recognizeMock
      .mockResolvedValueOnce({ data: { text: 'garbage-1', confidence: 10 } })
      .mockResolvedValueOnce({ data: { text: 'garbage-2', confidence: 20 } })
      .mockResolvedValueOnce({ data: { text: '山田太郎\nyamada@example.com', confidence: 92 } })
      .mockResolvedValue({ data: { text: 'garbage-rest', confidence: 5 } })

    const file = new File([''], 'card.png', { type: 'image/png' })
    const result = await extractCardFieldsFromImage(file)

    expect(recognizeMock).toHaveBeenCalledTimes(8) // 4 rotations x 2 language models
    expect(result.email).toBe('yamada@example.com')
  })

  it('terminates every worker after use', async () => {
    recognizeMock.mockResolvedValue({ data: { text: '', confidence: 0 } })
    const file = new File([''], 'card.png', { type: 'image/png' })

    await extractCardFieldsFromImage(file)

    expect(terminateMock).toHaveBeenCalledTimes(2)
  })
})
