'use client'

import { Text } from 'react-konva'
import { useMetroLabels } from './hooks/useMetroLabels'
import type { MetroLabelsProps } from './types'

export const MetroLabels = ({ visuals, stationNames, textRef }: MetroLabelsProps) => {
  const { labelData } = useMetroLabels(visuals, stationNames)

  return (
    <>
      {labelData.map((label) => (
        <Text
          key={`label-${label.id}`}
          ref={(node) => {
            if (node) {
              textRef.current[label.id] = node
            }
          }}
          x={label.x}
          y={label.y}
          text={label.text}
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
      ))}
    </>
  )
}
