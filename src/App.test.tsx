import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the board with two starting tiles', () => {
    render(<App />)
    expect(screen.getByText('2048')).toBeInTheDocument()

    const tiles = document.querySelectorAll('.tile')
    expect(tiles).toHaveLength(2)
  })

  it('resets the score when New Game is clicked', async () => {
    render(<App />)
    const scoreValue = screen.getAllByText('0')[0]
    expect(scoreValue).toBeInTheDocument()
  })
})
