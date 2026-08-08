'use client'

import { useMetroStore } from '@/store'

import { Line } from 'react-konva'
import type { MetroLinesProps } from './types'

export const MetroLines = ({ visuals, lineRef }: MetroLinesProps) => {
  const lines = useMetroStore((state) => state.lines)

  return (
    <>
      {lines.map((line) => {
        const points: Array<number> = []
        if (line.visualStationIds) {
          for (const visualId of line.visualStationIds) {
            const visual = visuals[visualId]
            if (visual) {
              points.push(visual.x, visual.y)
            }
          }
        }

        return (
          <Line
            key={line.id}
            ref={(node) => {
              if (node) {
                lineRef.current[line.id] = node
              }
            }}
            points={points}
            stroke={line.color}
            strokeWidth={6}
            tension={0.3}
            lineCap="round"
            lineJoin="round"
            listening={false}
          />
        )
      })}
    </>
  )
}
