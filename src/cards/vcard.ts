import type { BusinessCard } from './types'

function escapeVCardText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export function toVCard(card: BusinessCard): string {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escapeVCardText(card.name)}`, `N:${escapeVCardText(card.name)};;;;`]

  const org = [card.company, card.department].filter(Boolean).map(escapeVCardText).join(';')
  if (org) lines.push(`ORG:${org}`)
  if (card.title) lines.push(`TITLE:${escapeVCardText(card.title)}`)
  if (card.phone) lines.push(`TEL;TYPE=CELL:${escapeVCardText(card.phone)}`)
  if (card.email) lines.push(`EMAIL:${escapeVCardText(card.email)}`)
  if (card.address) lines.push(`ADR;TYPE=WORK:;;${escapeVCardText(card.address)};;;;`)
  if (card.note) lines.push(`NOTE:${escapeVCardText(card.note)}`)

  lines.push('END:VCARD')
  return lines.join('\r\n')
}
