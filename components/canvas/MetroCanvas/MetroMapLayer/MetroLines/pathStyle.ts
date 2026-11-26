import type { Segment } from './buildSegments'

export type InteractiveProps = object

export interface PathVisualProps {
  segment: Segment
  color: string
  isHovered: boolean
  hoverColor: string
  interactiveProps: InteractiveProps
}

export const shadowProps = (isHovered: boolean, hoverColor: string) => ({
  shadowColor: isHovered ? hoverColor : undefined,
  shadowBlur: isHovered ? 3 : 0,
  shadowOpacity: isHovered ? 1 : 0,
})
