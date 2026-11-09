import { Text } from 'react-konva'

import type { BadgeGeometry } from '../types'

interface LineBadgeTextProps {
  text: string
  geometry: BadgeGeometry
  color: string
}

export const LineBadgeText = ({ text, geometry, color }: LineBadgeTextProps) => {
  const { width, height, fontSize } = geometry

  return (
    <Text
      text={text}
      width={width}
      height={height}
      offsetX={width / 2}
      offsetY={height / 2}
      align="center"
      verticalAlign="middle"
      fontStyle="bold"
      fontSize={fontSize}
      fill={color}
      listening={false}
    />
  )
}
