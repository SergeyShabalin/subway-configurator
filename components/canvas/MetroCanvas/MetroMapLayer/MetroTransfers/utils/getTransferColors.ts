import type { VisualStation } from '@/types/metro'
import { FALLBACK_COLOR } from '../constants'

interface GetTransferColorsParams {
  visuals: Record<string, VisualStation>
  visualToStations: Record<string, Array<string>>
  stations: Array<{
    id: string
    line_id: string | number
  }>
  lines: Array<{
    id: string | number
    color: string
  }>
}

export const getTransferColors = ({
  visuals,
  visualToStations,
  stations,
  lines,
}: GetTransferColorsParams): Record<string, string> => {
  const colors: Record<string, string> = {}

  for (const visualId of Object.keys(visuals)) {
    const stationId = visualToStations[visualId]?.[0]
    const station = stationId ? stations.find((item) => item.id === stationId) : undefined
    const line = station
      ? lines.find((item) => String(item.id) === String(station.line_id))
      : undefined

    colors[visualId] = line?.color ?? FALLBACK_COLOR
  }

  return colors
}
