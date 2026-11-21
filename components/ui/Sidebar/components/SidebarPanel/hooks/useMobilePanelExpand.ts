import type { PointerEvent } from 'react'
import { useEffect, useRef, useState } from 'react'

/** Смещение, меньше которого жест считается тапом */
const SLOP_PX = 6
/** Достаточное смещение для переключения состояния */
const SWIPE_DISTANCE_PX = 40
/** Достаточная скорость (px/ms) для флика */
const SWIPE_VELOCITY = 0.3
/** Если палец стоял дольше этого времени перед отпусканием, скорость не учитываем */
const VELOCITY_STALE_MS = 100
/** Чуть больше длительности CSS-transition высоты */
const SNAP_DURATION_MS = 250

interface DragState {
  startY: number
  lastY: number
  lastTime: number
  velocity: number // px/ms, > 0 — движение вверх
  startHeight: number
  startExpanded: boolean
  minHeight: number
  maxHeight: number
  moved: boolean
}

interface UseMobilePanelExpandParams {
  enabled: boolean
}

/**
 * Временно применяет к панели заданную высоту, измеряет её и возвращает всё обратно.
 * Синхронно, без перерисовки.
 */
const measureHeight = (
  panel: HTMLElement,
  height: string,
  expandedAttr: 'true' | 'false'
): number => {
  const prevHeight = panel.style.height
  const prevMaxHeight = panel.style.maxHeight
  const prevTransition = panel.style.transition
  const prevExpanded = panel.getAttribute('data-expanded')

  panel.style.transition = 'none'
  panel.style.height = height
  panel.style.maxHeight = 'none'
  panel.setAttribute('data-expanded', expandedAttr)

  const result = panel.getBoundingClientRect().height

  panel.style.height = prevHeight
  panel.style.maxHeight = prevMaxHeight
  panel.style.transition = prevTransition
  if (prevExpanded === null) panel.removeAttribute('data-expanded')
  else panel.setAttribute('data-expanded', prevExpanded)

  return result
}

/** Максимум = то, что реально отдаёт CSS (с учётом безопасных зон) */
const measureMaxHeight = (panel: HTMLElement): number =>
  measureHeight(panel, 'min(var(--panel-expanded-height, 90dvh), var(--panel-limit))', 'true')

/** Минимум = естественная высота свёрнутой панели по контенту */
const measureMinHeight = (panel: HTMLElement): number => measureHeight(panel, 'auto', 'false')

export const useMobilePanelExpand = ({ enabled }: UseMobilePanelExpandParams) => {
  const drag = useRef<DragState | null>(null)
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [dragHeight, setDragHeight] = useState<number | null>(null)
  /** Целевая высота в px на время анимации после отпускания пальца */
  const [snapHeight, setSnapHeight] = useState<number | null>(null)

  const isDragging = dragHeight !== null

  useEffect(
    () => () => {
      if (snapTimer.current) clearTimeout(snapTimer.current)
    },
    []
  )

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled) return
    if ((event.target as HTMLElement).closest('button')) return

    const panel = event.currentTarget.closest('[data-sidebar-panel]') as HTMLElement | null
    if (!panel) return

    if (snapTimer.current) clearTimeout(snapTimer.current)
    setSnapHeight(null)

    const maxHeight = measureMaxHeight(panel)
    const minHeight = Math.min(measureMinHeight(panel), maxHeight)

    drag.current = {
      startY: event.clientY,
      lastY: event.clientY,
      lastTime: performance.now(),
      velocity: 0,
      startHeight: panel.getBoundingClientRect().height,
      startExpanded: expanded,
      minHeight,
      maxHeight,
      moved: false,
    }

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current
    if (!enabled || !state) return

    const delta = state.startY - event.clientY // > 0 — вверх

    if (!state.moved) {
      if (Math.abs(delta) < SLOP_PX) return
      state.moved = true
    }

    const now = performance.now()
    const dt = now - state.lastTime
    if (dt > 0) {
      const instantVelocity = (state.lastY - event.clientY) / dt
      state.velocity = state.velocity * 0.3 + instantVelocity * 0.7
    }
    state.lastY = event.clientY
    state.lastTime = now

    const nextHeight = state.startHeight + delta
    setDragHeight(Math.max(state.minHeight, Math.min(nextHeight, state.maxHeight)))
  }

  const handlePointerUp = () => {
    const state = drag.current
    drag.current = null
    if (!enabled || !state) return

    // Обычный тап по заголовку — ничего не меняем
    if (!state.moved) return

    const totalDelta = state.startY - state.lastY
    const isStale = performance.now() - state.lastTime > VELOCITY_STALE_MS
    const velocity = isStale ? 0 : state.velocity

    let nextExpanded = state.startExpanded

    if (Math.abs(velocity) >= SWIPE_VELOCITY) {
      nextExpanded = velocity > 0
    } else if (Math.abs(totalDelta) >= SWIPE_DISTANCE_PX) {
      nextExpanded = totalDelta > 0
    }

    setExpanded(nextExpanded)
    setDragHeight(null)

    // Плавно доезжаем до целевой высоты в px, затем отдаём управление CSS
    setSnapHeight(nextExpanded ? state.maxHeight : state.minHeight)
    if (snapTimer.current) clearTimeout(snapTimer.current)
    snapTimer.current = setTimeout(() => setSnapHeight(null), SNAP_DURATION_MS)
  }

  const getPanelStyleOverride = (): { height?: string; maxHeight?: string } => {
    const height = dragHeight ?? snapHeight
    return height !== null ? { height: `${height}px`, maxHeight: 'none' } : {}
  }

  const getPanelClassName = (baseClassName: string, expandedClassName: string): string => {
    if (!enabled || !expanded) return baseClassName
    return `${baseClassName} ${expandedClassName}`
  }

  return {
    isDragging,
    // Во время жеста контент уже показываем, чтобы не было пустоты под пальцем
    isExpanded: enabled && (expanded || isDragging),
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    getPanelStyleOverride,
    getPanelClassName,
  }
}
