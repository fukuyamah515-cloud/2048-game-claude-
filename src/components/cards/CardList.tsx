import { CardItem } from './CardItem'
import type { BusinessCard } from '../../cards/types'

interface CardListProps {
  cards: BusinessCard[]
  onEdit: (card: BusinessCard) => void
  onDelete: (id: string) => void
  onOpenDetail: (card: BusinessCard) => void
}

export function CardList({ cards, onEdit, onDelete, onOpenDetail }: CardListProps) {
  if (cards.length === 0) {
    return <p className="card-list-empty">登録された名刺がありません</p>
  }

  return (
    <ul className="card-list">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpenDetail={onOpenDetail}
        />
      ))}
    </ul>
  )
}
