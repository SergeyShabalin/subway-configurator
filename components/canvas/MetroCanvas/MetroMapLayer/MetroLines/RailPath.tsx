import type Konva from 'konva'
import { Path } from 'react-konva'
import { bezierToPath } from './geometry/bezier'
import { offsetBezier } from './geometry/offsetBezier'
import type { LineStroke } from './lineStroke'
import { shadowProps, type PathVisualProps } from './pathStyle'

interface RailPathProps extends PathVisualProps {
  stroke: LineStroke
  leftRef: (node: Konva.Path | null) => void
  rightRef: (node: Konva.Path | null) => void
}

export const RailPath = ({
  segment,
  color,
  stroke,
  isHovered,
  hoverColor,
  interactiveProps,
  leftRef,
  rightRef,
}: RailPathProps) => {
  const half = stroke.gap / 2
  const left = offsetBezier(segment.bezier, -half)
  const right = offsetBezier(segment.bezier, half)

  const shared = {
    perfectDrawEnabled: false,
    stroke: color,
    strokeWidth: stroke.width,
    lineCap: 'round' as const,
    lineJoin: 'round' as const,
    ...shadowProps(isHovered, hoverColor),
  }

  return (
    <>
      <Path
        ref={leftRef}
        data={bezierToPath(left)}
        {...shared}
        hitStrokeWidth={stroke.hitWidth}
        {...interactiveProps}
      />
      <Path ref={rightRef} data={bezierToPath(right)} {...shared} listening={false} />
    </>
  )
}
