import { describe, expect, it } from 'vitest'
import {
  addRandomTile,
  canMove,
  createEmptyBoard,
  getEmptyCells,
  hasWon,
  move,
} from './board'
import type { Board } from './types'

describe('move', () => {
  it('slides tiles left and compacts gaps', () => {
    const board: Board = [
      [0, 2, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = move(board, 'left')
    expect(result.board[0]).toEqual([4, 0, 0, 0])
    expect(result.moved).toBe(true)
    expect(result.scoreGained).toBe(4)
  })

  it('merges each tile at most once per move', () => {
    const board: Board = [[2, 2, 2, 2]]
    const result = move(board, 'left')
    expect(result.board[0]).toEqual([4, 4, 0, 0])
    expect(result.scoreGained).toBe(8)
  })

  it('merges leftmost pair first, matching official 2048 behavior', () => {
    const board: Board = [[2, 2, 2, 0]]
    const result = move(board, 'left')
    expect(result.board[0]).toEqual([4, 2, 0, 0])
  })

  it('slides right, keeping merge priority from the right edge', () => {
    const board: Board = [[2, 2, 2, 0]]
    const result = move(board, 'right')
    expect(result.board[0]).toEqual([0, 0, 2, 4])
  })

  it('moves vertically via up/down', () => {
    const board: Board = [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [4, 0, 0, 0],
    ]
    const down = move(board, 'down')
    expect(down.board.map((row) => row[0])).toEqual([0, 0, 4, 4])

    const up = move(board, 'up')
    expect(up.board.map((row) => row[0])).toEqual([4, 4, 0, 0])
  })

  it('reports moved: false when nothing changes', () => {
    const board: Board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]
    const result = move(board, 'left')
    expect(result.moved).toBe(false)
    expect(result.scoreGained).toBe(0)
  })
})

describe('addRandomTile', () => {
  it('adds exactly one tile of value 2 or 4 to an empty board', () => {
    const board = createEmptyBoard()
    const next = addRandomTile(board)
    const nonZero = next.flat().filter((v) => v !== 0)
    expect(nonZero).toHaveLength(1)
    expect([2, 4]).toContain(nonZero[0])
  })

  it('returns the same board reference when there is no space', () => {
    const full: Board = Array.from({ length: 4 }, () => Array(4).fill(2))
    expect(addRandomTile(full)).toBe(full)
  })
})

describe('getEmptyCells', () => {
  it('finds all zero cells', () => {
    const board: Board = [
      [0, 2],
      [2, 0],
    ]
    expect(getEmptyCells(board)).toEqual([
      [0, 0],
      [1, 1],
    ])
  })
})

describe('canMove', () => {
  it('is true when empty cells exist', () => {
    const board: Board = [
      [2, 4],
      [4, 0],
    ]
    expect(canMove(board)).toBe(true)
  })

  it('is true when adjacent equal tiles can merge', () => {
    const board: Board = [
      [2, 2],
      [4, 8],
    ]
    expect(canMove(board)).toBe(true)
  })

  it('is false for a full board with no adjacent equal tiles', () => {
    const board: Board = [
      [2, 4],
      [4, 2],
    ]
    expect(canMove(board)).toBe(false)
  })
})

describe('hasWon', () => {
  it('detects a tile at or above the target value', () => {
    const board: Board = [[2048, 0]]
    expect(hasWon(board)).toBe(true)
    expect(hasWon(board, 4096)).toBe(false)
  })
})
