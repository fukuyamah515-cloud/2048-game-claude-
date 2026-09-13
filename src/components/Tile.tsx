interface TileProps {
  row: number
  col: number
  value: number
}

export function Tile({ row, col, value }: TileProps) {
  return (
    <div
      className={`tile tile-${value}`}
      style={{
        '--row': row,
        '--col': col,
      } as React.CSSProperties}
    >
      {value}
    </div>
  )
}
