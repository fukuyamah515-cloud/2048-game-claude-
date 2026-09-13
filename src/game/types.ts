export type Cell = number // 0 means empty
export type Board = Cell[][]

export type Direction = 'up' | 'down' | 'left' | 'right'

export interface MoveResult {
  board: Board
  moved: boolean
  scoreGained: number
}
