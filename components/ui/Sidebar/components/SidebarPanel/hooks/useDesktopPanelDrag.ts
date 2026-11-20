import type { PointerEvent } from 'react'
import { useRef } from 'react'
import { PanelPosition } from '@/components/ui/Sidebar/types'

interface UseDesktopPanelDragParams {
  enabled: boolean
  position: PanelPosition
  width: number
  onPositionChange: (position: PanelPosition) => void
}

interface DragOffset {
  x: number
  y: number
}

const MIN_LEFT = 92
const MIN_TOP = 8
const EDGE_PADDING = 16

export const useDesktopPanelDrag = ({
  enabled,
  position,
  width,
  onPositionChange,
}: UseDesktopPanelDragParams) => {
  const dragOffset = useRef<DragOffset | null>(null)

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled) return
    if ((event.target as HTMLElement).closest('button')) return

    dragOffset.current = {
      x: event.clientX - position.left,
      y: event.clientY - position.top,
    }

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragOffset.current) return

    const panel = event.currentTarget.closest('[data-sidebar-panel]') as HTMLElement | null
    if (!panel) return

    const panelHeight = panel.getBoundingClientRect().height

    onPositionChange({
      left: Math.max(
        MIN_LEFT,
        Math.min(event.clientX - dragOffset.current.x, window.innerWidth - width - EDGE_PADDING)
      ),
      top: Math.max(
        MIN_TOP,
        Math.min(event.clientY - dragOffset.current.y, window.innerHeight - panelHeight - MIN_TOP)
      ),
    })
  }

  const handlePointerUp = () => {
    dragOffset.current = null
  }

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  }
}
