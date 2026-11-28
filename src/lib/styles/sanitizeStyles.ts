import type { MapStyles } from '@/types/metro'
import { LINE_CURVATURE_SPEC } from './lineCurvature'
import { sanitizeLineValues } from './lineValue'
import { LINE_WIDTH_SPEC } from './lineWidth'
import { sanitizeLabels } from './sanitizeLabels'
import { sanitizeStationStyles } from './sanitizeStationStyle'

export { LABEL_FONT_SIZE_MAX, LABEL_FONT_SIZE_MIN } from './sanitizeLabels'

export const sanitizeStyles = (raw: unknown): MapStyles => {
  const src = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>

  const labels = sanitizeLabels(src.labels)
  const stations = sanitizeStationStyles(src.stations)
  const lineWidths = sanitizeLineValues(LINE_WIDTH_SPEC, src.lineWidths)
  const lineCurvature = sanitizeLineValues(LINE_CURVATURE_SPEC, src.lineCurvature)

  return {
    ...(labels && { labels }),
    ...(stations && { stations }),
    ...(lineWidths && { lineWidths }),
    ...(lineCurvature && { lineCurvature }),
  }
}
