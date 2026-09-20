import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createCard } from '../../cards/cards'
import { CardTimeline } from './CardTimeline'
import type { BusinessCardInput } from '../../cards/types'

function makeInput(overrides: Partial<BusinessCardInput> = {}): BusinessCardInput {
  return {
    name: '山田太郎',
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

describe('CardTimeline', () => {
  it('shows an empty state when there are no notes', () => {
    render(<CardTimeline card={createCard(makeInput())} onAddNote={vi.fn()} />)
    expect(screen.getByText('まだメモがありません')).toBeInTheDocument()
  })

  it('calls onAddNote with the trimmed text and clears the input', async () => {
    const user = userEvent.setup()
    const onAddNote = vi.fn()
    render(<CardTimeline card={createCard(makeInput())} onAddNote={onAddNote} />)

    const input = screen.getByPlaceholderText('やり取りのメモを追加')
    await user.type(input, '  ランチをご一緒した  ')
    await user.click(screen.getByRole('button', { name: '追加' }))

    expect(onAddNote).toHaveBeenCalledWith('ランチをご一緒した')
    expect(input).toHaveValue('')
  })

  it('renders existing timeline notes', () => {
    const card = createCard(makeInput())
    card.timeline = [{ id: '1', date: Date.now(), text: '既存メモ' }]
    render(<CardTimeline card={card} onAddNote={vi.fn()} />)
    expect(screen.getByText('既存メモ')).toBeInTheDocument()
  })
})
