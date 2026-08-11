import type Konva from 'konva'
import { useCallback, useRef, useState } from 'react'

interface UseStageZoomOptions {
  minScale?: number
  maxScale?: number
  scaleStep?: number
}

interface UseStageZoomReturn {
  stageRef: React.RefObject<Konva.Stage | null>
  stageScale: number
  stagePosition: { x: number; y: number }
  setStageScale: React.Dispatch<React.SetStateAction<number>>
  setStagePosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
  handleWheel: (e: Konva.KonvaEventObject<WheelEvent>) => void
  handleStageDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
  centerStage: (points: Array<{ x: number; y: number }>, width?: number, height?: number) => void
}

export function useStageZoom(options: UseStageZoomOptions = {}): UseStageZoomReturn {
  const { minScale = 0.1, maxScale = 5, scaleStep = 1.1 } = options

  const stageRef = useRef<Konva.Stage>(null)
  const [stageScale, setStageScale] = useState(1)
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault()

      const stage = stageRef.current
      if (!stage) return

      const oldScale = stageScale
      const pointer = stage.getPointerPosition()
      if (!pointer) return

      const mousePointTo = {
        x: (pointer.x - stagePosition.x) / oldScale,
        y: (pointer.y - stagePosition.y) / oldScale,
      }

      const direction = e.evt.deltaY > 0 ? -1 : 1
      const newScale = Math.min(
        Math.max(oldScale * (direction > 0 ? scaleStep : 1 / scaleStep), minScale),
        maxScale
      )

      setStageScale(newScale)
      setStagePosition({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      })
    },
    [stageScale, stagePosition, minScale, maxScale, scaleStep]
  )

  const handleStageDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const target = e.target
    if (target === stageRef.current) {
      setStagePosition({
        x: target.x(),
        y: target.y(),
      })
    }
  }, [])

  const centerStage = useCallback(
    (points: Array<{ x: number; y: number }>, width?: number, height?: number) => {
      const stage = stageRef.current
      if (!stage || points.length === 0) return

      const stageWidth = width ?? stage.width()
      const stageHeight = height ?? stage.height()

      let minX = Infinity,
        maxX = -Infinity
      let minY = Infinity,
        maxY = -Infinity

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
      const newScale = Math.min(scaleX, scaleY, 1.5, maxScale)

      setStageScale(Math.max(newScale, minScale))
      setStagePosition({
        x: stageWidth / 2 - centerX * newScale,
        y: stageHeight / 2 - centerY * newScale,
      })
    },
    [maxScale, minScale]
  )

  return {
    stageRef,
    stageScale,
    stagePosition,
    setStageScale,
    setStagePosition,
    handleWheel,
    handleStageDragEnd,
    centerStage,
  }
}
