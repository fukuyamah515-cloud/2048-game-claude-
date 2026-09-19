import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { CardManager } from './CardManager'

describe('CardManager', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the empty state when there are no cards', () => {
    render(<CardManager />)
    expect(screen.getByText('登録された名刺がありません')).toBeInTheDocument()
  })

  it('adds a new card and shows it in the list', async () => {
    const user = userEvent.setup()
    render(<CardManager />)

    await user.click(screen.getByRole('button', { name: '+ 新規追加' }))
    await user.type(screen.getByLabelText('氏名 *'), '山田太郎')
    await user.type(screen.getByLabelText('会社名'), 'サンプル商事')
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(screen.getByText('山田太郎')).toBeInTheDocument()
    expect(screen.getByText('サンプル商事')).toBeInTheDocument()
  })

  it('edits an existing card', async () => {
    const user = userEvent.setup()
    render(<CardManager />)

    await user.click(screen.getByRole('button', { name: '+ 新規追加' }))
    await user.type(screen.getByLabelText('氏名 *'), '山田太郎')
    await user.click(screen.getByRole('button', { name: '保存' }))

    await user.click(screen.getByRole('button', { name: '編集' }))
    const nameInput = screen.getByLabelText('氏名 *')
    await user.clear(nameInput)
    await user.type(nameInput, '山田次郎')
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(screen.getByText('山田次郎')).toBeInTheDocument()
    expect(screen.queryByText('山田太郎')).not.toBeInTheDocument()
  })

  it('deletes a card', async () => {
    const user = userEvent.setup()
    render(<CardManager />)

    await user.click(screen.getByRole('button', { name: '+ 新規追加' }))
    await user.type(screen.getByLabelText('氏名 *'), '山田太郎')
    await user.click(screen.getByRole('button', { name: '保存' }))

    await user.click(screen.getByRole('button', { name: '削除' }))

    expect(screen.getByText('登録された名刺がありません')).toBeInTheDocument()
  })

  it('filters the list via search', async () => {
    const user = userEvent.setup()
    render(<CardManager />)

    for (const name of ['山田太郎', '鈴木花子']) {
      await user.click(screen.getByRole('button', { name: '+ 新規追加' }))
      await user.type(screen.getByLabelText('氏名 *'), name)
      await user.click(screen.getByRole('button', { name: '保存' }))
    }

    await user.type(screen.getByPlaceholderText('名前・会社名・メールで検索'), '鈴木')

    expect(screen.getByText('鈴木花子')).toBeInTheDocument()
    expect(screen.queryByText('山田太郎')).not.toBeInTheDocument()
  })

  it('highlights a card with an overdue next action', async () => {
    const user = userEvent.setup()
    render(<CardManager />)

    await user.click(screen.getByRole('button', { name: '+ 新規追加' }))
    await user.type(screen.getByLabelText('氏名 *'), '山田太郎')
    await user.type(screen.getByLabelText('次回アクション予定日'), '2000-01-01')
    await user.click(screen.getByRole('button', { name: '保存' }))

    const item = screen.getByText('山田太郎').closest('li')
    expect(item).not.toBeNull()
    expect(item).toHaveClass('overdue')
    expect(within(item as HTMLElement).getByText('期限超過')).toBeInTheDocument()
  })

  it('renders an "add to contacts" action for each card', async () => {
    const user = userEvent.setup()
    render(<CardManager />)

    await user.click(screen.getByRole('button', { name: '+ 新規追加' }))
    await user.type(screen.getByLabelText('氏名 *'), '山田太郎')
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(screen.getByRole('button', { name: '連絡先に追加' })).toBeInTheDocument()
  })
})
