'use client'

import type Konva from 'konva'
import { useEffect, useRef } from 'react'

interface Params {
  /** Ссылка на Konva Stage из useStageZoom. */
  stageRef: React.RefObject<Konva.Stage | null>
  /** Текущий масштаб стадии (из useStageZoom). */
  stageScale: number
  /** Текущая позиция стадии (из useStageZoom). */
  stagePosition: { x: number; y: number }
  /** Аналог onWheel: применяет новый масштаб к точке под курсором. */
  handleWheel: (e: Konva.KonvaEventObject<WheelEvent>) => void
  /** Аналог правого клика: открыть меню в мировых координатах. */
  onLongPress: (worldX: number, worldY: number) => void
  /** Включить обработчики (например, `!isBusy`). */
  enabled: boolean
  /** Длительность удержания для long-press, мс. */
  longPressMs?: number
  /** Допустимое смещение пальца во время long-press, px. */
  longPressMoveTolerance?: number
}

const DEFAULT_LONG_PRESS_MS = 500
const DEFAULT_MOVE_TOLERANCE = 10
/** Основание степени в handleWheel (`scale *= BASE ** (-deltaY / 100)`). */
const WHEEL_BASE = 1.1

/**
 * Тач-жесты для канваса:
 * - pinch двумя пальцами → масштабирование, как колесо мыши;
 * - long-press одним пальцем → контекстное меню в точке нажатия.
 *
 * Работает поверх Konva Stage, не ломая обычный drag и тапы по элементам.
 * Слушатели вешаются на DOM-контейнер стадии, поэтому не конфликтуют с Konva.
 */
export const useTouchGestures = ({
  stageRef,
  stageScale,
  stagePosition,
  handleWheel,
  onLongPress,
  enabled,
  longPressMs = DEFAULT_LONG_PRESS_MS,
  longPressMoveTolerance = DEFAULT_MOVE_TOLERANCE,
}: Params) => {
  // Держим актуальные значения в ref, чтобы не пересоздавать слушатели при каждом рендере
  const wheelRef = useRef(handleWheel)
  const longPressRef = useRef(onLongPress)
  const scaleRef = useRef(stageScale)
  const posRef = useRef(stagePosition)

  // Обновляем ref уже после рендера — так требует react-hooks/refs.
  // Слушатели читают ref в момент события, поэтому всегда видят свежие значения.
  useEffect(() => {
    wheelRef.current = handleWheel
    longPressRef.current = onLongPress
    scaleRef.current = stageScale
    posRef.current = stagePosition
  })

  useEffect(() => {
    if (!enabled) return

    const stage = stageRef.current
    if (!stage) return
    const container = stage.container()

    // --- long-press ---
    let longPressTimer: number | null = null
    let touchStart: { x: number; y: number; id: number } | null = null

    const clearLongPress = () => {
      if (longPressTimer !== null) {
        window.clearTimeout(longPressTimer)
        longPressTimer = null
      }
    }

    // --- pinch ---
    let pinch: { distance: number; scale: number } | null = null

    const distance = (t1: Touch, t2: Touch) =>
      Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)

    const onTouchStart = (ev: TouchEvent) => {
      clearLongPress()

      if (ev.touches.length === 2) {
        pinch = {
          distance: distance(ev.touches[0], ev.touches[1]),
          scale: scaleRef.current,
        }
        touchStart = null
        return
      }

      if (ev.touches.length === 1) {
        const touch = ev.touches[0]
        touchStart = { x: touch.clientX, y: touch.clientY, id: touch.identifier }

        longPressTimer = window.setTimeout(() => {
          longPressTimer = null
          const rect = container.getBoundingClientRect()
          const screenX = touch.clientX - rect.left
          const screenY = touch.clientY - rect.top
          const worldX = (screenX - posRef.current.x) / scaleRef.current
          const worldY = (screenY - posRef.current.y) / scaleRef.current
          longPressRef.current(worldX, worldY)
        }, longPressMs)
      }
    }

    const onTouchMove = (ev: TouchEvent) => {
      // Один палец: если сдвинулся — это drag, long-press отменяем
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

      // Два пальца: pinch
      if (ev.touches.length === 2 && pinch) {
        const d = distance(ev.touches[0], ev.touches[1])
        if (d === 0) return

        const ratio = d / pinch.distance
        const targetScale = pinch.scale * ratio
        const currentScale = scaleRef.current
        if (currentScale === 0) return

        // Превращаем pinch в синтетическое wheel-событие:
        // handleWheel меняет масштаб на WHEEL_BASE ** (-deltaY / 100).
        const desiredStep = Math.log(targetScale / currentScale) / Math.log(WHEEL_BASE)
        const deltaY = -desiredStep * 100

        const rect = container.getBoundingClientRect()
        const midX = (ev.touches[0].clientX + ev.touches[1].clientX) / 2 - rect.left
        const midY = (ev.touches[0].clientY + ev.touches[1].clientY) / 2 - rect.top

        wheelRef.current({
          evt: { preventDefault: () => {}, clientX: midX, clientY: midY, deltaY },
          target: stage,
        } as unknown as Konva.KonvaEventObject<WheelEvent>)

        // Обновляем базу, чтобы следующее движение считалось от новой точки
        pinch = { distance: d, scale: targetScale }
      }
    }

    const onTouchEnd = (ev: TouchEvent) => {
      clearLongPress()
      touchStart = null
      if (ev.touches.length < 2) pinch = null
    }

    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchmove', onTouchMove, { passive: true })
    container.addEventListener('touchend', onTouchEnd, { passive: true })
    container.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      clearLongPress()
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove', onTouchMove)
      container.removeEventListener('touchend', onTouchEnd)
      container.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [enabled, stageRef, longPressMs, longPressMoveTolerance])
}
