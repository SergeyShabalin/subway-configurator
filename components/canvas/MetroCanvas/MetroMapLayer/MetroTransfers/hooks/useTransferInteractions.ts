import type Konva from 'konva'
import { useState } from 'react'

export const useTransferInteractions = () => {
  const [hoveredTransfer, setHoveredTransfer] = useState<string | null>(null)

  const handleMouseEnter = (e: Konva.KonvaEventObject<MouseEvent>, id: string) => {
    const stage = e.target.getStage()
    if (stage) {
      stage.container().style.cursor = 'pointer'
    }
    setHoveredTransfer(id)
  }

  const handleMouseLeave = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (stage) {
      stage.container().style.cursor = 'default'
    }
    setHoveredTransfer(null)
  }

  const handleClick = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
    transferId: string,
    onTransferClick?: (transfer: string) => void
  ) => {
    e.cancelBubble = true
    onTransferClick?.(transferId)
  }

  return {
    hoveredTransfer,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
  }
}
