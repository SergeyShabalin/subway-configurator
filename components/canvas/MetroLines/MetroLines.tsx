'use client'

import { Line } from 'react-konva'
import { useMetroLines } from './hooks/useMetroLines'
import type { MetroLinesProps } from './types'

export const MetroLines = ({ visuals, lineRef }: MetroLinesProps) => {
  const { lineData } = useMetroLines()

  return (
    <>
      {lineData.map((line) => {
        const points: Array<number> = []

        for (const visualId of line.visualStationIds) {
          const visual = visuals[visualId]
          if (visual) {
            points.push(visual.x, visual.y)
          }
        }

        if (points.length < 4) {
          console.log(`⚠️ [MetroLines] Line ${line.id} has only ${points.length} points, skipping`)
          return null
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
