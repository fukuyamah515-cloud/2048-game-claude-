import { isOverdue } from '../../cards/cards'
import { toVCard } from '../../cards/vcard'
import type { BusinessCard } from '../../cards/types'
import { FOLLOW_UP_LABELS } from './CardForm'

interface CardItemProps {
  card: BusinessCard
  onEdit: (card: BusinessCard) => void
  onDelete: (id: string) => void
  onOpenDetail: (card: BusinessCard) => void
}

function formatDate(value: number | null): string {
  if (value === null) return '未設定'
  return new Date(value).toLocaleDateString('ja-JP')
}

function handleAddToContacts(card: BusinessCard) {
  const blob = new Blob([toVCard(card)], { type: 'text/vcard' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  // Some mobile browsers drop non-ASCII `download` attribute values (falling back to a
  // generic name with no extension), which breaks the "open to add contact" flow. Keep
  // the filename ASCII-safe; the person's name is still inside the vCard content.
  link.download = 'contact.vcf'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function CardItem({ card, onEdit, onDelete, onOpenDetail }: CardItemProps) {
  const overdue = isOverdue(card)

  return (
    <li className={`card-item${overdue ? ' overdue' : ''}`}>
      <div className="card-item-main">
        <p className="card-item-name">{card.name}</p>
        <p className="card-item-company">
          {[card.company, card.department, card.title].filter(Boolean).join(' / ')}
        </p>
        {card.email && <p className="card-item-detail">{card.email}</p>}
        {card.phone && <p className="card-item-detail">{card.phone}</p>}
        <p className="card-item-followup">
          <span className={`badge badge-${card.followUpStatus}`}>
            {FOLLOW_UP_LABELS[card.followUpStatus]}
          </span>
          次回アクション: {formatDate(card.nextActionAt)}
          {overdue && <span className="badge-overdue">期限超過</span>}
        </p>
      </div>
      <div className="card-item-actions">
        <button type="button" onClick={() => onOpenDetail(card)}>
          詳細
        </button>
        <button type="button" onClick={() => onEdit(card)}>
          編集
        </button>
        <button type="button" onClick={() => onDelete(card.id)}>
          削除
        </button>
        <button type="button" onClick={() => handleAddToContacts(card)}>
          連絡先に追加
        </button>
      </div>
    </li>
  )
}
