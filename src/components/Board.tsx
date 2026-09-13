import type { Board as BoardType } from '../game/types'
import { Tile } from './Tile'

interface BoardProps {
  board: BoardType
}

export function Board({ board }: BoardProps) {
  const size = board.length

  return (
    <div
      className="board"
      style={{ '--size': size } as React.CSSProperties}
    >
      {board.map((row, r) =>
        row.map((_, c) => <div key={`${r}-${c}`} className="cell" />),
      )}

      {board.map((row, r) =>
        row.map((value, c) =>
          value !== 0 ? (
            <Tile key={`${r}-${c}-${value}`} row={r} col={c} value={value} />
          ) : null,
        ),
      )}
    </div>
  )
}
