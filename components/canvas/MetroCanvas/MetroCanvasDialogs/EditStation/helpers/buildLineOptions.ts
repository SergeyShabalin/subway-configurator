import type { Line, Station } from '@/types/metro'
import type { LineOption } from '../types'

/** Станции узла (по одной на ветку) для выбора, откуда удалять */
export const buildLineOptions = (
  nodeStationIds: ReadonlyArray<string>,
  stations: ReadonlyArray<Station>,
  lines: ReadonlyArray<Line>
): Array<LineOption> =>
  nodeStationIds.flatMap((id): Array<LineOption> => {
    const nodeStation = stations.find((s) => s.id === id)
    const line = nodeStation
      ? lines.find((l) => String(l.id) === String(nodeStation.line_id))
      : undefined

    if (!nodeStation || !line) return []

    return [
      {
        stationId: nodeStation.id,
        lineId: line.id,
        lineName: line.name,
        lineColor: line.color,
      },
    ]
  })
