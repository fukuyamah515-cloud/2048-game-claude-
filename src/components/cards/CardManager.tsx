import { useState } from 'react'
import { searchCards, sortByNextAction } from '../../cards/cards'
import { useCards } from '../../hooks/useCards'
import { CardForm } from './CardForm'
import { CardGroupView } from './CardGroupView'
import { CardImageImport } from './CardImageImport'
import { CardList } from './CardList'
import { CardTimeline } from './CardTimeline'
import type { BusinessCard, BusinessCardInput, GroupKey } from '../../cards/types'
import './cards.css'

type Mode =
  | { kind: 'list' }
  | { kind: 'add'; prefill?: Partial<BusinessCardInput> }
  | { kind: 'edit'; card: BusinessCard }
  | { kind: 'import' }
  | { kind: 'detail'; cardId: string }

const GROUP_KEY_LABELS: Record<GroupKey, string> = {
  company: '会社',
  industry: '業種',
  religiousAffiliation: '宗派',
}

export function CardManager() {
  const { cards, addCard, updateCard, deleteCard, addTimelineNote } = useCards()
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<Mode>({ kind: 'list' })
  const [listView, setListView] = useState<'list' | 'group'>('list')
  const [groupKey, setGroupKey] = useState<GroupKey>('company')

  const visibleCards = sortByNextAction(searchCards(cards, search))
  const detailCard = mode.kind === 'detail' ? cards.find((c) => c.id === mode.cardId) : undefined

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

      {mode.kind === 'list' && (
        <div className="card-manager-view-toggle">
          <button
            type="button"
            className={listView === 'list' ? 'active' : ''}
            onClick={() => setListView('list')}
          >
            一覧
          </button>
          <button
            type="button"
            className={listView === 'group' ? 'active' : ''}
            onClick={() => setListView('group')}
          >
            グループ表示
          </button>
          {listView === 'group' && (
            <select value={groupKey} onChange={(e) => setGroupKey(e.target.value as GroupKey)}>
              {(Object.keys(GROUP_KEY_LABELS) as GroupKey[]).map((key) => (
                <option key={key} value={key}>
                  {GROUP_KEY_LABELS[key]}ごと
                </option>
              ))}
            </select>
          )}
        </div>
      )}

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

      {mode.kind === 'detail' &&
        (detailCard ? (
          <div className="card-detail">
            <button type="button" onClick={() => setMode({ kind: 'list' })}>
              ← 一覧に戻る
            </button>
            <h3 className="card-detail-name">{detailCard.name}</h3>
            <p className="card-detail-meta">
              {[detailCard.company, detailCard.department, detailCard.title]
                .filter(Boolean)
                .join(' / ')}
            </p>
            {detailCard.introducedBy && <p>紹介者: {detailCard.introducedBy}</p>}
            {detailCard.metAt && <p>出会った場所・イベント: {detailCard.metAt}</p>}
            {detailCard.industry && <p>業種: {detailCard.industry}</p>}
            {detailCard.religiousAffiliation && <p>宗派: {detailCard.religiousAffiliation}</p>}
            <CardTimeline
              card={detailCard}
              onAddNote={(text) => addTimelineNote(detailCard.id, text)}
            />
          </div>
        ) : (
          <p className="card-list-empty">この名刺は削除されました</p>
        ))}

      {mode.kind === 'list' && listView === 'list' && (
        <CardList
          cards={visibleCards}
          onEdit={(card) => setMode({ kind: 'edit', card })}
          onDelete={deleteCard}
          onOpenDetail={(card) => setMode({ kind: 'detail', cardId: card.id })}
        />
      )}

      {mode.kind === 'list' && listView === 'group' && (
        <CardGroupView
          cards={visibleCards}
          groupKey={groupKey}
          onEdit={(card) => setMode({ kind: 'edit', card })}
          onDelete={deleteCard}
          onOpenDetail={(card) => setMode({ kind: 'detail', cardId: card.id })}
        />
      )}
    </div>
  )
}
