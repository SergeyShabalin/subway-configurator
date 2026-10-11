'use client'

import { useMetroStore } from '@/store'
import type { VisualStation } from '@/types/metro'
import { Line } from 'react-konva'

interface MetroTransfersProps {
  visuals: Record<string, VisualStation>
}

export const MetroTransfers = ({ visuals }: MetroTransfersProps) => {
  const visualTransfers = useMetroStore((state) => state.visualTransfers)

  return (
    <>
      {visualTransfers.map((transfer) => {
        const from = visuals[transfer.from_visual_id]
        const to = visuals[transfer.to_visual_id]

        if (!from || !to) return null

        return (
          <Line
            key={transfer.id}
            points={[from.x, from.y, to.x, to.y]}
            stroke="#94a3b8"
            strokeWidth={2}
            dash={[6, 6]}
            opacity={0.7}
            lineCap="round"
            listening={false}
          />
        )
      })}
    </>
  )
}
