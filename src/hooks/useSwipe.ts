import { useRef } from 'react'
import type { Direction } from '../game/types'

const MIN_SWIPE_DISTANCE = 30

export function useSwipe(onSwipe: (direction: Direction) => void) {
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  function handleTouchStart(event: React.TouchEvent) {
    const touch = event.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (!touchStart.current) return
    const touch = event.changedTouches[0]
    const dx = touch.clientX - touchStart.current.x
    const dy = touch.clientY - touchStart.current.y
    touchStart.current = null

    if (Math.max(Math.abs(dx), Math.abs(dy)) < MIN_SWIPE_DISTANCE) return

    if (Math.abs(dx) > Math.abs(dy)) {
      onSwipe(dx > 0 ? 'right' : 'left')
    } else {
      onSwipe(dy > 0 ? 'down' : 'up')
    }
  }

  return { onTouchStart: handleTouchStart, onTouchEnd: handleTouchEnd }
}
