import type { StationAppearance } from '../../types'
import { buildGradientStops } from './buildGradientStops'
import { getStationStrokeWidth } from './getStationStrokeWidth'

interface Params {
  appearance: StationAppearance
  isDimmed: boolean
  dimmedColor: string
  radius: number
}

export const getStationStrokeProps = ({ appearance, isDimmed, dimmedColor, radius }: Params) => {
  const { isMultiLine, color, colors, colorsActive } = appearance
  const strokeWidth = getStationStrokeWidth(appearance)

  if (isDimmed) return { stroke: dimmedColor, strokeWidth }

  if (isMultiLine && colors && colors.length >= 2) {
    // Линия, которую маршрут в этом узле не использует, попадает в градиент серой
    const stopColors = colors.map((c, i) => (colorsActive?.[i] === false ? dimmedColor : c))

    // Координаты градиента локальные: центр круга в (0, 0)
    return {
      strokeWidth,
      strokeLinearGradientStartPoint: { x: -radius, y: -radius },
      strokeLinearGradientEndPoint: { x: radius, y: radius },
      strokeLinearGradientColorStops: buildGradientStops(stopColors),
    }
  }

  return { stroke: color || '#888888', strokeWidth }
}
