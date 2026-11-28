import type { StationAppearance } from '../../types'
import { buildGradientStops } from './buildGradientStops'
import { getStationStrokeWidth } from './getStationStrokeWidth'

interface Params {
  appearance: StationAppearance
  isDimmed: boolean
  dimmedColor: string
  /** Радиус круга или половина стороны квадрата */
  radius: number
  strokeScale: number
  isSquare: boolean
}

export const getStationStrokeProps = ({
  appearance,
  isDimmed,
  dimmedColor,
  radius,
  strokeScale,
  isSquare,
}: Params) => {
  const { isMultiLine, color, colors, colorsActive } = appearance
  const strokeWidth = getStationStrokeWidth(appearance) * strokeScale

  if (isDimmed) return { stroke: dimmedColor, strokeWidth }

  if (isMultiLine && colors && colors.length >= 2) {
    // Линия, которую маршрут в этом узле не использует, попадает в градиент серой
    const stopColors = colors.map((c, i) => (colorsActive?.[i] === false ? dimmedColor : c))

    // Координаты градиента локальные. У круга центр в (0, 0), у квадрата с offset — в (radius, radius)
    const center = isSquare ? radius : 0

    return {
      strokeWidth,
      strokeLinearGradientStartPoint: { x: center - radius, y: center - radius },
      strokeLinearGradientEndPoint: { x: center + radius, y: center + radius },
      strokeLinearGradientColorStops: buildGradientStops(stopColors),
    }
  }

  return { stroke: color || '#888888', strokeWidth }
}
