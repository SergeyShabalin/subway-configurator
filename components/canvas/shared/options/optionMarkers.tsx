import { OptionColors } from '@/components/ui/Dropdown/DropdownMenu/OptionColors/OptionColors'
import { LineBadgeIcon } from '@/components/ui/LineBadgeIcon/LineBadgeIcon'
import type { Line } from '@/types/metro'
import type { ReactNode } from 'react'

const shapeOf = (line: Line) => (line.type === 'commuter_rail' ? 'parallelogram' : 'circle')

/** Значки линий. Для линии без `lineBadge` показывается цветная точка этой линии. */
export const lineMarker = (lines: ReadonlyArray<Line>): ReactNode => {
  if (lines.length === 0) return undefined

  return (
    <span style={{ display: 'flex', gap: 4 }}>
      {lines.map((line) =>
        line.lineBadge ? (
          <LineBadgeIcon
            key={line.id}
            text={line.lineBadge}
            color={line.color}
            shape={shapeOf(line)}
          />
        ) : (
          <OptionColors key={line.id} color={line.color} />
        )
      )}
    </span>
  )
}
