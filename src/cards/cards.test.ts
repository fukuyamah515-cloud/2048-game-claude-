import { describe, expect, it } from 'vitest'
import {
  addCard,
  addTimelineNote,
  createCard,
  deleteCard,
  groupBy,
  isOverdue,
  searchCards,
  sortByNextAction,
  updateCard,
} from './cards'
import type { BusinessCard, BusinessCardInput } from './types'

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
    industry: 'IT',
    religiousAffiliation: '',
    ...overrides,
  }
}

describe('createCard', () => {
  it('assigns an id and timestamps', () => {
    const card = createCard(makeInput())
    expect(card.id).toBeTruthy()
    expect(card.createdAt).toBeGreaterThan(0)
    expect(card.updatedAt).toBe(card.createdAt)
    expect(card.timeline).toEqual([])
    expect(card.name).toBe('山田太郎')
  })
})

describe('addCard', () => {
  it('prepends the new card', () => {
    const first = createCard(makeInput({ name: 'A' }))
    const second = createCard(makeInput({ name: 'B' }))
    const result = addCard([first], second)
    expect(result.map((c) => c.name)).toEqual(['B', 'A'])
  })
})

describe('updateCard', () => {
  it('updates the matching card and bumps updatedAt', () => {
    const card = createCard(makeInput({ name: 'A' }))
    const updated = updateCard([card], card.id, makeInput({ name: 'A-updated' }))
    expect(updated[0].name).toBe('A-updated')
    expect(updated[0].updatedAt).toBeGreaterThanOrEqual(card.updatedAt)
  })

  it('leaves other cards untouched', () => {
    const a = createCard(makeInput({ name: 'A' }))
    const b = createCard(makeInput({ name: 'B' }))
    const updated = updateCard([a, b], a.id, makeInput({ name: 'A-updated' }))
    expect(updated[1].name).toBe('B')
  })
})

describe('deleteCard', () => {
  it('removes the matching card', () => {
    const a = createCard(makeInput({ name: 'A' }))
    const b = createCard(makeInput({ name: 'B' }))
    expect(deleteCard([a, b], a.id).map((c) => c.name)).toEqual(['B'])
  })
})

describe('searchCards', () => {
  const cards: BusinessCard[] = [
    createCard(makeInput({ name: '山田太郎', company: 'サンプル商事' })),
    createCard(makeInput({ name: '鈴木花子', company: 'テスト工業', email: 'suzuki@test.com' })),
  ]

  it('returns all cards for an empty query', () => {
    expect(searchCards(cards, '')).toHaveLength(2)
  })

  it('matches case-insensitively across name/company/email', () => {
    expect(searchCards(cards, '山田')).toHaveLength(1)
    expect(searchCards(cards, 'テスト')).toHaveLength(1)
    expect(searchCards(cards, 'SUZUKI')).toHaveLength(1)
    expect(searchCards(cards, '該当なし')).toHaveLength(0)
  })
})

describe('sortByNextAction', () => {
  it('sorts by soonest nextActionAt, with null last', () => {
    const soon = createCard(makeInput({ name: 'soon', nextActionAt: 100 }))
    const later = createCard(makeInput({ name: 'later', nextActionAt: 200 }))
    const none = createCard(makeInput({ name: 'none', nextActionAt: null }))
    const sorted = sortByNextAction([later, none, soon])
    expect(sorted.map((c) => c.name)).toEqual(['soon', 'later', 'none'])
  })
})

describe('isOverdue', () => {
  it('is true when nextActionAt is in the past and not done', () => {
    const card = createCard(makeInput({ nextActionAt: 100, followUpStatus: 'in_progress' }))
    expect(isOverdue(card, 200)).toBe(true)
  })

  it('is false when status is done', () => {
    const card = createCard(makeInput({ nextActionAt: 100, followUpStatus: 'done' }))
    expect(isOverdue(card, 200)).toBe(false)
  })

  it('is false when there is no nextActionAt', () => {
    const card = createCard(makeInput({ nextActionAt: null }))
    expect(isOverdue(card, 200)).toBe(false)
  })
})

describe('addTimelineNote', () => {
  it('prepends a note to the matching card', () => {
    const card = createCard(makeInput())
    const updated = addTimelineNote([card], card.id, 'ランチをご一緒した')
    expect(updated[0].timeline).toHaveLength(1)
    expect(updated[0].timeline[0].text).toBe('ランチをご一緒した')
  })
})

describe('groupBy', () => {
  it('groups by the given key, bucketing blanks as 未分類', () => {
    const cards = [
      createCard(makeInput({ industry: 'IT' })),
      createCard(makeInput({ industry: 'IT' })),
      createCard(makeInput({ industry: '' })),
    ]
    const grouped = groupBy(cards, 'industry')
    expect(grouped['IT']).toHaveLength(2)
    expect(grouped['未分類']).toHaveLength(1)
  })

  it('groups by religiousAffiliation', () => {
    const cards = [
      createCard(makeInput({ religiousAffiliation: '浄土宗' })),
      createCard(makeInput({ religiousAffiliation: '真言宗' })),
    ]
    const grouped = groupBy(cards, 'religiousAffiliation')
    expect(Object.keys(grouped).sort()).toEqual(['浄土宗', '真言宗'])
  })
})
