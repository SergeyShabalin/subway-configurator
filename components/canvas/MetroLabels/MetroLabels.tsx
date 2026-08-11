'use client'

import { useMetroStore } from '@/store'
import { Text } from 'react-konva'
import type { MetroLabelsProps } from './types'

export const MetroLabels = ({ visuals, stationNames, textRef }: MetroLabelsProps) => {
  const visualToStations = useMetroStore((state) => state.visualToStations)

  return (
    <>
      {Object.values(visuals).map((visual) => {
        const stationIds = visualToStations[visual.id] || []
        const firstStationId = stationIds.length > 0 ? stationIds[0] : null
        const name = firstStationId ? stationNames[firstStationId] : ''

        if (!name) return null

        return (
          <Text
            key={`label-${visual.id}`}
            ref={(node) => {
              if (node) {
                textRef.current[visual.id] = node
              }
            }}
            x={visual.x + visual.labelOffset.x}
            y={visual.y + visual.labelOffset.y}
            text={name}
            fontSize={16}
            fontFamily="Arial"
            fill="#e2e8f0"
            align="center"
            verticalAlign="middle"
            listening={false}
            letterSpacing={2}
            stroke="#020913"
            strokeWidth={0.3}
          />
        )
      })}
    </>
  )
}
