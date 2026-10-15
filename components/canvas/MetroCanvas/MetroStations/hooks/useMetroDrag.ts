import { useMetroStore } from '@/store'
import type Konva from 'konva'
import { useCallback } from 'react'

export const useMetroDrag = () => {
  const setDragging = useMetroStore((state) => state.setDragging)
  const updateVisualPosition = useMetroStore((state) => state.updateVisualPosition)

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

      const state = useMetroStore.getState()
      const currentVisual = state.visuals[visualId]
      if (!currentVisual) return

      const labelOffset = currentVisual.labelOffset ?? { x: 0, y: -60 }

      const affectedLines = state.lines.filter((line) => line.visualStationIds?.includes(visualId))

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
      if (textNode) {
        textNode.x(newX + (labelOffset.x ?? 0))
        textNode.y(newY + (labelOffset.y ?? -60))
      }

      updateVisualPosition(visualId, newX, newY)
    },
    [updateVisualPosition]
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

  return { handleDragStart, handleDragMove, handleDragEnd }
}
