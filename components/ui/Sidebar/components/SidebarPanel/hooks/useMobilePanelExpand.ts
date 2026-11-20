import type { PointerEvent } from 'react'
import { useRef, useState } from 'react'

const MIN_HEIGHT_RATIO = 0.45
const MAX_HEIGHT_RATIO = 0.9

interface UseMobilePanelExpandParams {
  enabled: boolean
}

export const useMobilePanelExpand = ({ enabled }: UseMobilePanelExpandParams) => {
  const dragStart = useRef<{ startY: number; startHeight: number } | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [dragHeight, setDragHeight] = useState<number | null>(null)

  const isDragging = dragHeight !== null

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled) return
    if ((event.target as HTMLElement).closest('button')) return

    const panel = event.currentTarget.closest('[data-sidebar-panel]') as HTMLElement | null
    if (!panel) return

    dragStart.current = {
      startY: event.clientY,
      startHeight: panel.getBoundingClientRect().height,
    }

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled || !dragStart.current) return

    const delta = dragStart.current.startY - event.clientY
    const nextHeight = dragStart.current.startHeight + delta
    const minH = window.innerHeight * MIN_HEIGHT_RATIO
    const maxH = window.innerHeight * MAX_HEIGHT_RATIO

    setDragHeight(Math.max(minH, Math.min(nextHeight, maxH)))
  }

  const handlePointerUp = () => {
    if (!enabled || !dragStart.current) return

    const startHeight = dragStart.current.startHeight
    const currentHeight = dragHeight ?? startHeight
    const threshold = (startHeight + window.innerHeight * MAX_HEIGHT_RATIO) / 2

    setExpanded(currentHeight > threshold)
    setDragHeight(null)
    dragStart.current = null
  }

  const getPanelStyleOverride = (): { height?: string; maxHeight?: string } =>
    dragHeight !== null ? { height: `${dragHeight}px`, maxHeight: 'none' } : {}

  const getPanelClassName = (baseClassName: string, expandedClassName: string): string => {
    if (!enabled || !expanded) return baseClassName
    return `${baseClassName} ${expandedClassName}`
  }

  return {
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    getPanelStyleOverride,
    getPanelClassName,
  }
}
