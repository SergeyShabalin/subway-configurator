import type { PointerEvent } from 'react'
import { useRef, useState } from 'react'

const DEFAULT_COLLAPSED_RATIO = 0.45
const DEFAULT_EXPANDED_RATIO = 0.9

interface DragStartState {
  startY: number
  startHeight: number
  minHeight: number
  maxHeight: number
}

interface UseMobilePanelExpandParams {
  enabled: boolean
}

/**
 * Читает границы высот из CSS-переменных панели.
 * Переменные задаются в SidebarPanel из mobileHeights (или дефолты).
 * Значения в dvh, поэтому переводим в px через innerHeight.
 */
const readPanelHeights = (panel: HTMLElement): { minHeight: number; maxHeight: number } => {
  const styles = getComputedStyle(panel)
  const vh = window.innerHeight / 100

  const collapsedRaw = styles.getPropertyValue('--panel-collapsed-height').trim()
  const expandedRaw = styles.getPropertyValue('--panel-expanded-height').trim()

  const collapsed = parseFloat(collapsedRaw) || DEFAULT_COLLAPSED_RATIO * 100
  const expanded = parseFloat(expandedRaw) || DEFAULT_EXPANDED_RATIO * 100

  return {
    minHeight: collapsed * vh,
    maxHeight: expanded * vh,
  }
}

export const useMobilePanelExpand = ({ enabled }: UseMobilePanelExpandParams) => {
  const dragStart = useRef<DragStartState | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [dragHeight, setDragHeight] = useState<number | null>(null)

  const isDragging = dragHeight !== null

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled) return
    if ((event.target as HTMLElement).closest('button')) return

    const panel = event.currentTarget.closest('[data-sidebar-panel]') as HTMLElement | null
    if (!panel) return

    const { minHeight, maxHeight } = readPanelHeights(panel)

    dragStart.current = {
      startY: event.clientY,
      startHeight: panel.getBoundingClientRect().height,
      minHeight,
      maxHeight,
    }

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled || !dragStart.current) return

    const delta = dragStart.current.startY - event.clientY
    const nextHeight = dragStart.current.startHeight + delta
    const { minHeight, maxHeight } = dragStart.current

    setDragHeight(Math.max(minHeight, Math.min(nextHeight, maxHeight)))
  }

  const handlePointerUp = () => {
    if (!enabled || !dragStart.current) return

    const { startHeight, maxHeight } = dragStart.current
    const currentHeight = dragHeight ?? startHeight
    const threshold = (startHeight + maxHeight) / 2

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
