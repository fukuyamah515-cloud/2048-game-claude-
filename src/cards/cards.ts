import type { BusinessCard, BusinessCardInput, GroupKey, TimelineNote } from './types'

export function createCard(input: BusinessCardInput): BusinessCard {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    ...input,
    timeline: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function addCard(cards: BusinessCard[], card: BusinessCard): BusinessCard[] {
  return [card, ...cards]
}

export function updateCard(
  cards: BusinessCard[],
  id: string,
  input: BusinessCardInput,
): BusinessCard[] {
  return cards.map((card) =>
    card.id === id ? { ...card, ...input, updatedAt: Date.now() } : card,
  )
}

export function deleteCard(cards: BusinessCard[], id: string): BusinessCard[] {
  return cards.filter((card) => card.id !== id)
}

export function searchCards(cards: BusinessCard[], query: string): BusinessCard[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return cards

  return cards.filter((card) =>
    [card.name, card.company, card.department, card.email].some((field) =>
      field.toLowerCase().includes(normalized),
    ),
  )
}

export function sortByNextAction(cards: BusinessCard[]): BusinessCard[] {
  return [...cards].sort((a, b) => {
    if (a.nextActionAt === null && b.nextActionAt === null) return 0
    if (a.nextActionAt === null) return 1
    if (b.nextActionAt === null) return -1
    return a.nextActionAt - b.nextActionAt
  })
}

export function isOverdue(card: BusinessCard, now: number = Date.now()): boolean {
  return (
    card.nextActionAt !== null && card.nextActionAt < now && card.followUpStatus !== 'done'
  )
}

export function addTimelineNote(
  cards: BusinessCard[],
  cardId: string,
  text: string,
): BusinessCard[] {
  const note: TimelineNote = { id: crypto.randomUUID(), date: Date.now(), text }
  return cards.map((card) =>
    card.id === cardId
      ? { ...card, timeline: [note, ...card.timeline], updatedAt: Date.now() }
      : card,
  )
}

export function groupBy(cards: BusinessCard[], key: GroupKey): Record<string, BusinessCard[]> {
  const UNCATEGORIZED = '未分類'
  return cards.reduce<Record<string, BusinessCard[]>>((groups, card) => {
    const value = card[key].trim() || UNCATEGORIZED
    groups[value] = [...(groups[value] ?? []), card]
    return groups
  }, {})
}
