import { useMetroStore } from '@/store'
import type Konva from 'konva'
import { useCallback, useRef } from 'react'
import type { VisualData } from '../types'

export const useMetroDrag = (
  visuals: Record<string, VisualData>,
  setVisuals: (
    value:
      | Record<string, VisualData>
      | ((prev: Record<string, VisualData>) => Record<string, VisualData>)
  ) => void
) => {
  const { lines, setDragging } = useMetroStore()
  const visualsRef = useRef(visuals)

  const handleDragStart = useCallback(() => {
    setDragging(true)
  }, [setDragging])

  const handleDragMove = useCallback(
    (
      e: Konva.KonvaEventObject<DragEvent>,
      visualId: string,
      lineRef: React.MutableRefObject<Record<string, Konva.Line>>,
      textRef: React.MutableRefObject<Record<string, Konva.Text>>
    ) => {
      const newX = e.target.x()
      const newY = e.target.y()

      const currentVisual = visualsRef.current[visualId]
      if (currentVisual) {
        visualsRef.current[visualId] = {
          ...currentVisual,
          x: newX,
          y: newY,
        }
      }

      const affectedLines = lines.filter((line) => line.visualStationIds?.includes(visualId))
      for (const line of affectedLines) {
        const lineNode = lineRef.current[line.id]
        if (!lineNode) continue
        const points = lineNode.points() as Array<number>
        const visualIndex = line.visualStationIds?.findIndex((id) => id === visualId) ?? -1
        if (visualIndex !== -1) {
          points[visualIndex * 2] = newX
          points[visualIndex * 2 + 1] = newY
          lineNode.points(points)
        }
      }

      const textNode = textRef.current[visualId]
      const visual = visualsRef.current[visualId]
      if (textNode && visual) {
        const labelOffset = visual.labelOffset || { x: 0, y: -60 }
        textNode.x(newX + (labelOffset.x ?? 0))
        textNode.y(newY + (labelOffset.y ?? -60))
      }

      setVisuals((prev) => ({
        ...prev,
        [visualId]: {
          ...prev[visualId],
          x: newX,
          y: newY,
          labelOffset: prev[visualId]?.labelOffset || { x: 0, y: -60 },
        },
      }))
    },
    [lines, setVisuals]
  )

  const handleDragEnd = useCallback(
    (
      e: Konva.KonvaEventObject<DragEvent>,
      visualId: string,
      onSave: (id: string, x: number, y: number) => void
    ) => {
      const newX = e.target.x()
      const newY = e.target.y()
      onSave(visualId, newX, newY)
      setDragging(false)
    },
    [setDragging]
  )

  return { handleDragStart, handleDragMove, handleDragEnd, visualsRef }
}
