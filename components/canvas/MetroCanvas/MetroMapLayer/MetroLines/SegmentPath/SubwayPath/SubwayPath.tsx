import type Konva from 'konva'
import { Path } from 'react-konva'
import type { LineStroke } from '../../helpers/lineStroke'
import { shadowProps, type PathVisualProps } from '../../helpers/pathStyle'

interface SubwayPathProps extends PathVisualProps {
  stroke: LineStroke
  refCb: (node: Konva.Path | null) => void
}

export const SubwayPath = ({
  segment,
  color,
  stroke,
  isHovered,
  hoverColor,
  interactiveProps,
  refCb,
}: SubwayPathProps) => (
  <Path
    ref={refCb}
    perfectDrawEnabled={false}
    data={segment.path}
    {...shadowProps(isHovered, hoverColor)}
    stroke={color}
    strokeWidth={stroke.width}
    lineCap="round"
    lineJoin="round"
    hitStrokeWidth={stroke.hitWidth}
    {...interactiveProps}
  />
)
