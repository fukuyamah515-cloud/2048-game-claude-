import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createCard } from '../../cards/cards'
import { CardGroupView } from './CardGroupView'
import type { BusinessCardInput } from '../../cards/types'

function makeInput(overrides: Partial<BusinessCardInput> = {}): BusinessCardInput {
  return {
    name: '名前',
    company: '',
    department: '',
    title: '',
    email: '',
    phone: '',
    address: '',
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

describe('CardGroupView', () => {
  it('groups cards by the given key and shows a count per group', () => {
    const cards = [
      createCard(makeInput({ name: 'A', industry: 'IT' })),
      createCard(makeInput({ name: 'B', industry: 'IT' })),
      createCard(makeInput({ name: 'C', industry: '' })),
    ]
    render(
      <CardGroupView
        cards={cards}
        groupKey="industry"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onOpenDetail={vi.fn()}
      />,
    )
    expect(screen.getByText('IT（2件）')).toBeInTheDocument()
    expect(screen.getByText('未分類（1件）')).toBeInTheDocument()
  })

  it('groups by religiousAffiliation when that key is selected', () => {
    const cards = [
      createCard(makeInput({ name: 'A', religiousAffiliation: '浄土宗' })),
      createCard(makeInput({ name: 'B', religiousAffiliation: '真言宗' })),
    ]
    render(
      <CardGroupView
        cards={cards}
        groupKey="religiousAffiliation"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onOpenDetail={vi.fn()}
      />,
    )
    expect(screen.getByText('浄土宗（1件）')).toBeInTheDocument()
    expect(screen.getByText('真言宗（1件）')).toBeInTheDocument()
  })

  it('shows the empty state with no cards', () => {
    render(
      <CardGroupView
        cards={[]}
        groupKey="company"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onOpenDetail={vi.fn()}
      />,
    )
    expect(screen.getByText('登録された名刺がありません')).toBeInTheDocument()
  })
})
