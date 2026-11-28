import { CANVAS_DIMMED_COLOR } from '@/components/canvas/shared/dimmedColors'
import { CANVAS_HOVER_COLOR, CANVAS_STATION_FILL } from '@/components/canvas/shared/themeColors'
import { useTheme } from '@/context/theme-context'
import type { ResolvedStationStyle } from '@/src/lib/styles/stationStyle'
import type { StationAppearance } from '../../types'
import { getHoverShadowProps } from '../helpers/getHoverShadowProps'
import { getStationRadius } from '../helpers/getStationRadius'
import { getStationStrokeProps } from '../helpers/getStationStrokeProps'

interface Params {
  appearance: StationAppearance
  isDimmed: boolean
  isHovered: boolean
  style: ResolvedStationStyle
}

export const useStationCircleStyle = ({ appearance, isDimmed, isHovered, style }: Params) => {
  const { theme } = useTheme()

  // Для квадрата «радиус» — половина стороны
  const radius = getStationRadius(appearance) * style.sizeScale

  return {
    radius,
    fill: CANVAS_STATION_FILL[theme],
    strokeProps: getStationStrokeProps({
      appearance,
      isDimmed,
      dimmedColor: CANVAS_DIMMED_COLOR[theme],
      radius,
      strokeScale: style.strokeScale,
      isSquare: style.isSquare,
    }),
    // Затемнённая станция не интерактивна, подсветки при наведении нет
    shadowProps: getHoverShadowProps(isHovered && !isDimmed, CANVAS_HOVER_COLOR[theme]),
  }
}
