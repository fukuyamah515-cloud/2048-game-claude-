import { useState } from 'react'
import type { FormEvent } from 'react'
import type { BusinessCardInput, FollowUpStatus } from '../../cards/types'

interface CardFormProps {
  initialValue?: Partial<BusinessCardInput>
  onSubmit: (input: BusinessCardInput) => void
  onCancel: () => void
}

function timestampToDateInput(value: number | null): string {
  if (value === null) return ''
  const date = new Date(value)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function dateInputToTimestamp(value: string): number | null {
  if (!value) return null
  return new Date(`${value}T00:00:00`).getTime()
}

const FOLLOW_UP_LABELS: Record<FollowUpStatus, string> = {
  not_started: '未対応',
  in_progress: '対応中',
  done: '対応済み',
}

function toFormState(card?: Partial<BusinessCardInput>) {
  return {
    name: card?.name ?? '',
    company: card?.company ?? '',
    department: card?.department ?? '',
    title: card?.title ?? '',
    email: card?.email ?? '',
    phone: card?.phone ?? '',
    address: card?.address ?? '',
    note: card?.note ?? '',
    lastContactAt: timestampToDateInput(card?.lastContactAt ?? null),
    nextActionAt: timestampToDateInput(card?.nextActionAt ?? null),
    followUpStatus: card?.followUpStatus ?? ('not_started' as FollowUpStatus),
    introducedBy: card?.introducedBy ?? '',
    metAt: card?.metAt ?? '',
    industry: card?.industry ?? '',
    religiousAffiliation: card?.religiousAffiliation ?? '',
  }
}

export function CardForm({ initialValue, onSubmit, onCancel }: CardFormProps) {
  const [form, setForm] = useState(() => toFormState(initialValue))

  function handleChange<K extends keyof ReturnType<typeof toFormState>>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.name.trim()) return

    const input: BusinessCardInput = {
      name: form.name.trim(),
      company: form.company.trim(),
      department: form.department.trim(),
      title: form.title.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      note: form.note.trim(),
      lastContactAt: dateInputToTimestamp(form.lastContactAt),
      nextActionAt: dateInputToTimestamp(form.nextActionAt),
      followUpStatus: form.followUpStatus,
      introducedBy: form.introducedBy.trim(),
      metAt: form.metAt.trim(),
      industry: form.industry.trim(),
      religiousAffiliation: form.religiousAffiliation.trim(),
    }
    onSubmit(input)
  }

  return (
    <form className="card-form" onSubmit={handleSubmit}>
      <label>
        氏名 *
        <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
      </label>
      <label>
        会社名
        <input value={form.company} onChange={(e) => handleChange('company', e.target.value)} />
      </label>
      <label>
        部署
        <input value={form.department} onChange={(e) => handleChange('department', e.target.value)} />
      </label>
      <label>
        役職
        <input value={form.title} onChange={(e) => handleChange('title', e.target.value)} />
      </label>
      <label>
        メール
        <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
      </label>
      <label>
        電話番号
        <input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
      </label>
      <label>
        住所
        <input value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
      </label>
      <label>
        メモ
        <textarea value={form.note} onChange={(e) => handleChange('note', e.target.value)} />
      </label>
      <label>
        最終接触日
        <input
          type="date"
          value={form.lastContactAt}
          onChange={(e) => handleChange('lastContactAt', e.target.value)}
        />
      </label>
      <label>
        次回アクション予定日
        <input
          type="date"
          value={form.nextActionAt}
          onChange={(e) => handleChange('nextActionAt', e.target.value)}
        />
      </label>
      <label>
        対応状況
        <select
          value={form.followUpStatus}
          onChange={(e) => handleChange('followUpStatus', e.target.value)}
        >
          {(Object.keys(FOLLOW_UP_LABELS) as FollowUpStatus[]).map((status) => (
            <option key={status} value={status}>
              {FOLLOW_UP_LABELS[status]}
            </option>
          ))}
        </select>
      </label>

      <div className="card-form-actions">
        <button type="submit">保存</button>
        <button type="button" onClick={onCancel}>
          キャンセル
        </button>
      </div>
    </form>
  )
}

export { FOLLOW_UP_LABELS }
