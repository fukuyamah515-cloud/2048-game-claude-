import { useState } from 'react'
import type { FormEvent } from 'react'
import type { BusinessCard } from '../../cards/types'

interface CardTimelineProps {
  card: BusinessCard
  onAddNote: (text: string) => void
}

function formatDateTime(value: number): string {
  return new Date(value).toLocaleString('ja-JP')
}

export function CardTimeline({ card, onAddNote }: CardTimelineProps) {
  const [text, setText] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onAddNote(trimmed)
    setText('')
  }

  return (
    <div className="card-timeline">
      <form className="card-timeline-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="やり取りのメモを追加"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">追加</button>
      </form>

      {card.timeline.length === 0 ? (
        <p className="card-timeline-empty">まだメモがありません</p>
      ) : (
        <ul className="card-timeline-list">
          {card.timeline.map((note) => (
            <li key={note.id}>
              <span className="card-timeline-date">{formatDateTime(note.date)}</span>
              <span className="card-timeline-text">{note.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
