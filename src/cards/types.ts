export type FollowUpStatus = 'not_started' | 'in_progress' | 'done'

export interface TimelineNote {
  id: string
  date: number // epoch ms
  text: string
}

export interface BusinessCard {
  id: string
  name: string
  company: string
  department: string
  title: string
  email: string
  phone: string
  address: string
  note: string
  lastContactAt: number | null
  nextActionAt: number | null
  followUpStatus: FollowUpStatus
  introducedBy: string
  metAt: string
  industry: string
  religiousAffiliation: string
  timeline: TimelineNote[]
  createdAt: number
  updatedAt: number
}

export type BusinessCardInput = Pick<
  BusinessCard,
  | 'name'
  | 'company'
  | 'department'
  | 'title'
  | 'email'
  | 'phone'
  | 'address'
  | 'note'
  | 'lastContactAt'
  | 'nextActionAt'
  | 'followUpStatus'
  | 'introducedBy'
  | 'metAt'
  | 'industry'
  | 'religiousAffiliation'
>

export type GroupKey = 'company' | 'industry' | 'religiousAffiliation'
