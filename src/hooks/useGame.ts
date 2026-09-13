import { useCallback, useEffect, useReducer } from 'react'
import { addRandomTile, canMove, createInitialBoard, hasWon, move } from '../game/board'
import type { Board, Direction } from '../game/types'

const BEST_SCORE_KEY = '2048-best-score'

type Status = 'playing' | 'won' | 'lost'

interface GameState {
  board: Board
  score: number
  best: number
  status: Status
  /** true once the player has dismissed the win banner and kept playing */
  keepPlayingAfterWin: boolean
}

type GameAction =
  | { type: 'MOVE'; direction: Direction }
  | { type: 'RESET' }
  | { type: 'CONTINUE' }

function loadBestScore(): number {
  if (typeof localStorage === 'undefined') return 0
  return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0
}

function saveBestScore(score: number): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(BEST_SCORE_KEY, String(score))
}

function createInitialState(): GameState {
  return {
    board: createInitialBoard(),
    score: 0,
    best: loadBestScore(),
    status: 'playing',
    keepPlayingAfterWin: false,
  }
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'MOVE': {
      if (state.status === 'lost') return state
      if (state.status === 'won' && !state.keepPlayingAfterWin) return state

      const result = move(state.board, action.direction)
      if (!result.moved) return state

      const board = addRandomTile(result.board)
      const score = state.score + result.scoreGained
      const best = Math.max(state.best, score)
      if (best !== state.best) saveBestScore(best)

      const won = !state.keepPlayingAfterWin && hasWon(board)
      const status: Status = won ? 'won' : canMove(board) ? 'playing' : 'lost'

      return { ...state, board, score, best, status }
    }
    case 'CONTINUE':
      return { ...state, status: 'playing', keepPlayingAfterWin: true }
    case 'RESET':
      return createInitialState()
    default:
      return state
  }
}

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)

  const applyMove = useCallback((direction: Direction) => {
    dispatch({ type: 'MOVE', direction })
  }, [])

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])
  const continuePlaying = useCallback(() => dispatch({ type: 'CONTINUE' }), [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const direction = KEY_TO_DIRECTION[event.key]
      if (!direction) return
      event.preventDefault()
      applyMove(direction)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [applyMove])

  return { ...state, applyMove, reset, continuePlaying }
}
