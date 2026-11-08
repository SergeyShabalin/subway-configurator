'use client'

import type Konva from 'konva'
import { useEffect, useRef } from 'react'

interface Params {
  stageRef: React.RefObject<Konva.Stage | null>
  onLongPress: (worldX: number, worldY: number) => void
  /** Масштаб в точке экрана (камера). */
  zoomAt: (point: { x: number; y: number }, factor: number) => void
  /** Сдвиг камеры в пикселях экрана. */
  panBy: (dx: number, dy: number) => void
  /** Немедленно применить вид к сцене (по окончании жеста). */
  flush: () => void
  enabled: boolean
  longPressMs?: number
  longPressMoveTolerance?: number
}

const DEFAULT_LONG_PRESS_MS = 500
const DEFAULT_MOVE_TOLERANCE = 10

interface Point {
  x: number
  y: number
}

/**
 * Тач-жесты для канваса:
 * - pinch двумя пальцами: масштаб и сдвиг камерой (без перерисовки Konva во время жеста);
 * - long-press одним пальцем: контекстное меню в точке нажатия.
 *
 * `touchmove` слушается с `passive: false`, иначе браузер зумит страницу вместе с холстом.
 */
export const useTouchGestures = ({
  stageRef,
  onLongPress,
  zoomAt,
  panBy,
  flush,
  enabled,
  longPressMs = DEFAULT_LONG_PRESS_MS,
  longPressMoveTolerance = DEFAULT_MOVE_TOLERANCE,
}: Params) => {
  const handlers = useRef({ onLongPress, zoomAt, panBy, flush })

  useEffect(() => {
    handlers.current = { onLongPress, zoomAt, panBy, flush }
  })

  useEffect(() => {
    if (!enabled) return

    const stage = stageRef.current
    if (!stage) return
    const container = stage.container()

    const previousTouchAction = container.style.touchAction
    container.style.touchAction = 'none'

    let longPressTimer: number | null = null
    let touchStart: { x: number; y: number; id: number } | null = null
    let lastDistance = 0
    let lastCenter: Point | null = null

    const clearLongPress = () => {
      if (longPressTimer !== null) {
        window.clearTimeout(longPressTimer)
        longPressTimer = null
      }
    }

    const resetPinch = () => {
      lastDistance = 0
      lastCenter = null
    }

    const readPinch = (ev: TouchEvent): { distance: number; center: Point } => {
      const rect = container.getBoundingClientRect()
      const ax = ev.touches[0].clientX - rect.left
      const ay = ev.touches[0].clientY - rect.top
      const bx = ev.touches[1].clientX - rect.left
      const by = ev.touches[1].clientY - rect.top

      return {
        distance: Math.hypot(bx - ax, by - ay),
        center: { x: (ax + bx) / 2, y: (ay + by) / 2 },
      }
    }

    const onTouchStart = (ev: TouchEvent) => {
      clearLongPress()

      if (ev.touches.length === 2) {
        const { distance, center } = readPinch(ev)
        lastDistance = distance
        lastCenter = center
        touchStart = null
        return
      }

      if (ev.touches.length === 1) {
        resetPinch()

        const touch = ev.touches[0]
        touchStart = { x: touch.clientX, y: touch.clientY, id: touch.identifier }

        longPressTimer = window.setTimeout(() => {
          longPressTimer = null

          const rect = container.getBoundingClientRect()
          const world = stage
            .getAbsoluteTransform()
            .copy()
            .invert()
            .point({ x: touch.clientX - rect.left, y: touch.clientY - rect.top })

          handlers.current.onLongPress(world.x, world.y)
        }, longPressMs)
      }
    }

    const onTouchMove = (ev: TouchEvent) => {
      if (ev.touches.length === 1 && touchStart) {
        const touch = ev.touches[0]
        if (touch.identifier !== touchStart.id) return

        const dx = touch.clientX - touchStart.x
        const dy = touch.clientY - touchStart.y
        if (Math.hypot(dx, dy) > longPressMoveTolerance) {
          clearLongPress()
          touchStart = null
        }
        return
      }

      if (ev.touches.length !== 2) return

      ev.preventDefault()
      clearLongPress()
      stage.stopDrag()

      const { distance, center } = readPinch(ev)

      if (!lastCenter || lastDistance === 0 || distance === 0) {
        lastDistance = distance
        lastCenter = center
        return
      }

      // Масштаб вокруг прежнего центра, затем сдвиг на смещение центра
      handlers.current.zoomAt(lastCenter, distance / lastDistance)
      handlers.current.panBy(center.x - lastCenter.x, center.y - lastCenter.y)

      lastDistance = distance
      lastCenter = center
    }

    const onTouchEnd = (ev: TouchEvent) => {
      clearLongPress()
      touchStart = null

      if (ev.touches.length < 2) {
        if (lastDistance !== 0) handlers.current.flush() // сразу чёткая картинка
        resetPinch()
      }
    }

    const blockGesture = (ev: Event) => ev.preventDefault()

    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchmove', onTouchMove, { passive: false })
    container.addEventListener('touchend', onTouchEnd, { passive: true })
    container.addEventListener('touchcancel', onTouchEnd, { passive: true })
    container.addEventListener('gesturestart', blockGesture)
    container.addEventListener('gesturechange', blockGesture)

    return () => {
      clearLongPress()
      container.style.touchAction = previousTouchAction
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove', onTouchMove)
      container.removeEventListener('touchend', onTouchEnd)
      container.removeEventListener('touchcancel', onTouchEnd)
      container.removeEventListener('gesturestart', blockGesture)
      container.removeEventListener('gesturechange', blockGesture)
    }
  }, [enabled, stageRef, longPressMs, longPressMoveTolerance])
}
