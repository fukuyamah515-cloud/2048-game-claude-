import { describe, expect, it } from 'vitest'
import { createCard } from './cards'
import { toVCard } from './vcard'
import type { BusinessCardInput } from './types'

function makeInput(overrides: Partial<BusinessCardInput> = {}): BusinessCardInput {
  return {
    name: '山田太郎',
    company: '株式会社サンプル',
    department: '営業部',
    title: '部長',
    email: 'yamada@example.com',
    phone: '090-1234-5678',
    address: '東京都千代田区1-1-1',
    note: '',
    lastContactAt: null,
    nextActionAt: null,
    followUpStatus: 'not_started',
    introducedBy: '',
    metAt: '',
    industry: '',
    religiousAffiliation: '',
    ...overrides,
  }
}

describe('toVCard', () => {
  it('includes core fields', () => {
    const vcard = toVCard(createCard(makeInput()))
    expect(vcard).toContain('BEGIN:VCARD')
    expect(vcard).toContain('FN:山田太郎')
    expect(vcard).toContain('ORG:株式会社サンプル;営業部')
    expect(vcard).toContain('TITLE:部長')
    expect(vcard).toContain('TEL;TYPE=CELL:090-1234-5678')
    expect(vcard).toContain('EMAIL:yamada@example.com')
    expect(vcard).toContain('END:VCARD')
  })

  it('omits empty optional fields', () => {
    const vcard = toVCard(createCard(makeInput({ company: '', department: '', title: '' })))
    expect(vcard).not.toContain('ORG:')
    expect(vcard).not.toContain('TITLE:')
  })

  it('escapes commas, semicolons, and newlines in free-text fields', () => {
    const vcard = toVCard(
      createCard(makeInput({ address: '東京都; 1-1-1, 5F', note: '1行目\n2行目' })),
    )
    expect(vcard).toContain('東京都\\; 1-1-1\\, 5F')
    expect(vcard).toContain('NOTE:1行目\\n2行目')
  })
})
