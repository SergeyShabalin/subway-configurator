'use client'

import { Fragment } from 'react'
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
          return null
        }

        return (
          <Fragment key={line.id}>
            <Line
              points={points}
              stroke="#0f172a"
              strokeWidth={7}
              tension={0.3}
              lineCap="round"
              lineJoin="round"
              listening={false}
            />

            <Line
              ref={(node) => {
                if (node) {
                  lineRef.current[line.id] = node
                }
              }}
              perfectDrawEnabled={false}

              points={points}
              stroke={line.color}
              strokeWidth={6}
              tension={0.3}
              lineCap="round"
              lineJoin="round"
              listening={false}
            />
          </Fragment>
        )
      })}
    </>
  )
}
