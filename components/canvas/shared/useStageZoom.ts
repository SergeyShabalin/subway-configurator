import type Konva from 'konva'
import { useCallback, useEffect, useRef } from 'react'

const SETTLE_DELAY_MS = 150
const WHEEL_SENSITIVITY = 0.0015
const MAX_WHEEL_DELTA = 120

interface Point {
  x: number
  y: number
}

export function useStageZoom(
  minScale = 0.1,
  maxScale = 5,
  scaleStep = 1.1,
  onScaleChange?: (scale: number) => void
) {
  const stageRef = useRef<Konva.Stage>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const interacting = useRef(false)
  const scaleCallback = useRef(onScaleChange)

  useEffect(() => {
    scaleCallback.current = onScaleChange
  })

  const setHitGraph = useCallback((enabled: boolean) => {
    const layer = stageRef.current?.getLayers()[0]
    if (!layer) return

    layer.hitGraphEnabled(enabled)
  }, [])

  const beginInteraction = useCallback(() => {
    if (interacting.current) return

    interacting.current = true
    setHitGraph(false)
  }, [setHitGraph])

  const endInteraction = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }

    interacting.current = false

    setHitGraph(true)
    stageRef.current?.getLayers()[0]?.batchDraw()
  }, [setHitGraph])

  const refreshHitGraph = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }

    interacting.current = false

    const layer = stageRef.current?.getLayers()[0]
    if (!layer) return

    layer.hitGraphEnabled(true)
    layer.drawHit()
    layer.batchDraw()
  }, [])

  const scheduleEnd = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
    }

    timer.current = setTimeout(endInteraction, SETTLE_DELAY_MS)
  }, [endInteraction])

  const zoomAt = useCallback(
    (point: Point, factor: number) => {
      const stage = stageRef.current
      if (!stage) return

      const oldScale = stage.scaleX()
      const newScale = Math.min(Math.max(oldScale * factor, minScale), maxScale)

      if (newScale === oldScale) return

      beginInteraction()

      const pointTo = {
        x: (point.x - stage.x()) / oldScale,
        y: (point.y - stage.y()) / oldScale,
      }

      stage.scale({ x: newScale, y: newScale })

      stage.position({
        x: point.x - pointTo.x * newScale,
        y: point.y - pointTo.y * newScale,
      })

      stage.batchDraw()

      scaleCallback.current?.(newScale)
      scheduleEnd()
    },
    [beginInteraction, scheduleEnd, minScale, maxScale]
  )

  const panBy = useCallback(
    (dx: number, dy: number) => {
      const stage = stageRef.current
      if (!stage) return

      beginInteraction()

      stage.position({
        x: stage.x() + dx,
        y: stage.y() + dy,
      })

      stage.batchDraw()
      scheduleEnd()
    },
    [beginInteraction, scheduleEnd]
  )

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault()

      const stage = stageRef.current
      const pointer = stage?.getPointerPosition()

      if (!stage || !pointer) return

      const delta = Math.max(-MAX_WHEEL_DELTA, Math.min(MAX_WHEEL_DELTA, e.evt.deltaY))

      const factor = Math.exp(-delta * WHEEL_SENSITIVITY * (Math.log(scaleStep) / Math.log(1.1)))

      zoomAt(pointer, factor)
    },
    [zoomAt, scaleStep]
  )

  const centerStage = useCallback(
    (points: Array<Point>, width?: number, height?: number) => {
      const stage = stageRef.current
      if (!stage || points.length === 0) return

      const stageWidth = width ?? stage.width()
      const stageHeight = height ?? stage.height()

      let minX = Infinity
      let maxX = -Infinity
      let minY = Infinity
      let maxY = -Infinity

      for (const p of points) {
        if (p.x < minX) minX = p.x
        if (p.x > maxX) maxX = p.x
        if (p.y < minY) minY = p.y
        if (p.y > maxY) maxY = p.y
      }

      const centerX = (minX + maxX) / 2
      const centerY = (minY + maxY) / 2

      const mapWidth = maxX - minX || 1
      const mapHeight = maxY - minY || 1

      const padding = 100

      const scaleX = (stageWidth - padding * 2) / mapWidth
      const scaleY = (stageHeight - padding * 2) / mapHeight

      const finalScale = Math.max(Math.min(scaleX, scaleY, 1.5, maxScale), minScale)

      stage.scale({ x: finalScale, y: finalScale })

      stage.position({
        x: stageWidth / 2 - centerX * finalScale,
        y: stageHeight / 2 - centerY * finalScale,
      })

      stage.batchDraw()

      scaleCallback.current?.(finalScale)
    },
    [maxScale, minScale]
  )

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
    },
    []
  )

  return {
    stageRef,
    handleWheel,
    zoomAt,
    panBy,
    beginInteraction,
    endInteraction,
    refreshHitGraph,
    centerStage,
  }
}
