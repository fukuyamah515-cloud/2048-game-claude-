import { useState } from 'react'
import { searchCards, sortByNextAction } from '../../cards/cards'
import { useCards } from '../../hooks/useCards'
import { CardForm } from './CardForm'
import { CardList } from './CardList'
import type { BusinessCard } from '../../cards/types'
import './cards.css'

type Mode = { kind: 'list' } | { kind: 'add' } | { kind: 'edit'; card: BusinessCard }

export function CardManager() {
  const { cards, addCard, updateCard, deleteCard } = useCards()
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<Mode>({ kind: 'list' })

  const visibleCards = sortByNextAction(searchCards(cards, search))

  return (
    <div className="card-manager">
      <div className="card-manager-toolbar">
        <input
          type="search"
          placeholder="名前・会社名・メールで検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" onClick={() => setMode({ kind: 'add' })}>
          + 新規追加
        </button>
      </div>

      {mode.kind === 'add' && (
        <CardForm
          onSubmit={(input) => {
            addCard(input)
            setMode({ kind: 'list' })
          }}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}

      {mode.kind === 'edit' && (
        <CardForm
          initialValue={mode.card}
          onSubmit={(input) => {
            updateCard(mode.card.id, input)
            setMode({ kind: 'list' })
          }}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}

      {mode.kind === 'list' && (
        <CardList
          cards={visibleCards}
          onEdit={(card) => setMode({ kind: 'edit', card })}
          onDelete={deleteCard}
        />
      )}
    </div>
  )
}
