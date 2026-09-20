import { describe, expect, it, vi } from 'vitest'
import { extractCardFieldsFromImage, parseCardFields } from './ocr'

vi.mock('tesseract.js', () => ({
  recognize: vi.fn(),
}))

import { recognize } from 'tesseract.js'

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
  it('runs OCR with English+Japanese and parses the resulting text', async () => {
    vi.mocked(recognize).mockResolvedValue({
      data: { text: '山田太郎\nyamada@example.com' },
    } as Awaited<ReturnType<typeof recognize>>)

    const file = new File([''], 'card.png', { type: 'image/png' })
    const result = await extractCardFieldsFromImage(file)

    expect(recognize).toHaveBeenCalledWith(file, 'eng+jpn')
    expect(result.email).toBe('yamada@example.com')
    expect(result.company).toBe('山田太郎')
  })
})
