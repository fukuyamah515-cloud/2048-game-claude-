import type { Board, Direction, MoveResult } from './types'

export const BOARD_SIZE = 4
export const WINNING_VALUE = 2048

export function createEmptyBoard(size: number = BOARD_SIZE): Board {
  return Array.from({ length: size }, () => Array(size).fill(0))
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row])
}

export function getEmptyCells(board: Board): Array<[number, number]> {
  const cells: Array<[number, number]> = []
  board.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell === 0) cells.push([r, c])
    })
  })
  return cells
}

/** Returns a new board with one random tile (90% -> 2, 10% -> 4) placed in
 * an empty cell. Returns the same board reference if it's already full. */
export function addRandomTile(board: Board): Board {
  const empty = getEmptyCells(board)
  if (empty.length === 0) return board

  const [r, c] = empty[Math.floor(Math.random() * empty.length)]
  const next = cloneBoard(board)
  next[r][c] = Math.random() < 0.9 ? 2 : 4
  return next
}

export function boardsEqual(a: Board, b: Board): boolean {
  return a.every((row, r) => row.every((cell, c) => cell === b[r][c]))
}

/**
 * Slides and merges a single row to the left, 2048-style: each tile merges
 * with at most one other per move, and merges resolve leftmost-first.
 */
function slideRowLeft(row: number[]): { row: number[]; scoreGained: number } {
  const values = row.filter((v) => v !== 0)
  const result: number[] = []
  let scoreGained = 0

  for (let i = 0; i < values.length; i++) {
    const current = values[i]
    if (current === values[i + 1]) {
      const merged = current * 2
      result.push(merged)
      scoreGained += merged
      i++ // skip the tile we just merged into this one
    } else {
      result.push(current)
    }
  }

  while (result.length < row.length) result.push(0)
  return { row: result, scoreGained }
}

function reverseRow(row: number[]): number[] {
  return [...row].reverse()
}

function transpose(board: Board): Board {
  return board[0].map((_, c) => board.map((row) => row[c]))
}

/** Applies a move in the given direction without mutating the input board. */
export function move(board: Board, direction: Direction): MoveResult {
  let working: Board = cloneBoard(board)
  let scoreGained = 0

  if (direction === 'up' || direction === 'down') {
    working = transpose(working)
  }
  if (direction === 'right' || direction === 'down') {
    working = working.map(reverseRow)
  }

  working = working.map((row) => {
    const { row: slid, scoreGained: gained } = slideRowLeft(row)
    scoreGained += gained
    return slid
  })

  if (direction === 'right' || direction === 'down') {
    working = working.map(reverseRow)
  }
  if (direction === 'up' || direction === 'down') {
    working = transpose(working)
  }

  return { board: working, moved: !boardsEqual(board, working), scoreGained }
}

/** A move is possible if there's an empty cell, or two adjacent equal tiles. */
export function canMove(board: Board): boolean {
  if (getEmptyCells(board).length > 0) return true

  const size = board.length
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const value = board[r][c]
      if (c + 1 < size && board[r][c + 1] === value) return true
      if (r + 1 < size && board[r + 1][c] === value) return true
    }
  }
  return false
}

export function hasWon(board: Board, target: number = WINNING_VALUE): boolean {
  return board.some((row) => row.some((cell) => cell >= target))
}

export function createInitialBoard(size: number = BOARD_SIZE): Board {
  let board = createEmptyBoard(size)
  board = addRandomTile(board)
  board = addRandomTile(board)
  return board
}
