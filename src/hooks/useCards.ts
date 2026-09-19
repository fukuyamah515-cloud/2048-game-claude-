import { useCallback, useEffect, useReducer } from 'react'
import { addCard, addTimelineNote, createCard, deleteCard, updateCard } from '../cards/cards'
import type { BusinessCard, BusinessCardInput } from '../cards/types'

const CARDS_KEY = 'business-cards'

type CardsAction =
  | { type: 'ADD'; input: BusinessCardInput }
  | { type: 'UPDATE'; id: string; input: BusinessCardInput }
  | { type: 'DELETE'; id: string }
  | { type: 'ADD_TIMELINE_NOTE'; id: string; text: string }

function loadCards(): BusinessCard[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(CARDS_KEY)
    return raw ? (JSON.parse(raw) as BusinessCard[]) : []
  } catch {
    return []
  }
}

function saveCards(cards: BusinessCard[]): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(CARDS_KEY, JSON.stringify(cards))
}

function reducer(cards: BusinessCard[], action: CardsAction): BusinessCard[] {
  switch (action.type) {
    case 'ADD':
      return addCard(cards, createCard(action.input))
    case 'UPDATE':
      return updateCard(cards, action.id, action.input)
    case 'DELETE':
      return deleteCard(cards, action.id)
    case 'ADD_TIMELINE_NOTE':
      return addTimelineNote(cards, action.id, action.text)
    default:
      return cards
  }
}

export function useCards() {
  const [cards, dispatch] = useReducer(reducer, undefined, loadCards)

  useEffect(() => {
    saveCards(cards)
  }, [cards])

  const addCardEntry = useCallback((input: BusinessCardInput) => {
    dispatch({ type: 'ADD', input })
  }, [])

  const updateCardEntry = useCallback((id: string, input: BusinessCardInput) => {
    dispatch({ type: 'UPDATE', id, input })
  }, [])

  const deleteCardEntry = useCallback((id: string) => {
    dispatch({ type: 'DELETE', id })
  }, [])

  const addNote = useCallback((id: string, text: string) => {
    dispatch({ type: 'ADD_TIMELINE_NOTE', id, text })
  }, [])

  return {
    cards,
    addCard: addCardEntry,
    updateCard: updateCardEntry,
    deleteCard: deleteCardEntry,
    addTimelineNote: addNote,
  }
}
