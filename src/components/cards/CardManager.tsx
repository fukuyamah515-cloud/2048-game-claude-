import { useState } from 'react'
import { searchCards, sortByNextAction } from '../../cards/cards'
import { useCards } from '../../hooks/useCards'
import { CardForm } from './CardForm'
import { CardImageImport } from './CardImageImport'
import { CardList } from './CardList'
import type { BusinessCard, BusinessCardInput } from '../../cards/types'
import './cards.css'

type Mode =
  | { kind: 'list' }
  | { kind: 'add'; prefill?: Partial<BusinessCardInput> }
  | { kind: 'edit'; card: BusinessCard }
  | { kind: 'import' }

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
        <button type="button" onClick={() => setMode({ kind: 'import' })}>
          名刺画像から追加
        </button>
      </div>

      {mode.kind === 'import' && (
        <CardImageImport
          onExtracted={(fields) => setMode({ kind: 'add', prefill: fields })}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}

      {mode.kind === 'add' && (
        <CardForm
          initialValue={mode.prefill}
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
