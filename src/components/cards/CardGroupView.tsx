import { groupBy } from '../../cards/cards'
import { CardItem } from './CardItem'
import type { BusinessCard, GroupKey } from '../../cards/types'

interface CardGroupViewProps {
  cards: BusinessCard[]
  groupKey: GroupKey
  onEdit: (card: BusinessCard) => void
  onDelete: (id: string) => void
  onOpenDetail: (card: BusinessCard) => void
}

export function CardGroupView({
  cards,
  groupKey,
  onEdit,
  onDelete,
  onOpenDetail,
}: CardGroupViewProps) {
  if (cards.length === 0) {
    return <p className="card-list-empty">登録された名刺がありません</p>
  }

  const groups = groupBy(cards, groupKey)
  const groupNames = Object.keys(groups).sort((a, b) => a.localeCompare(b, 'ja'))

  return (
    <div className="card-group-view">
      {groupNames.map((name) => (
        <section key={name} className="card-group">
          <h3 className="card-group-title">
            {name}（{groups[name].length}件）
          </h3>
          <ul className="card-list">
            {groups[name].map((card) => (
              <CardItem
                key={card.id}
                card={card}
                onEdit={onEdit}
                onDelete={onDelete}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
