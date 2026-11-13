import type { Line, Station } from '@/types/metro'

/** Станция узла вместе с линией, на которой она лежит */
export interface StationOnLine {
  stationId: string
  line: Line
}

/** Поиск линий по станциям. Карты строятся один раз, ключи везде строковые. */
export const createLineLookup = (stations: ReadonlyArray<Station>, lines: ReadonlyArray<Line>) => {
  const stationById = new Map(stations.map((s) => [String(s.id), s]))
  const lineById = new Map(lines.map((l) => [String(l.id), l]))

  const getLineOfStation = (stationId: string): Line | undefined => {
    const station = stationById.get(String(stationId))
    return station ? lineById.get(String(station.line_id)) : undefined
  }

  /** По одной записи на станцию, порядок как во входном списке. Нужна, когда важна сама станция. */
  const getStationLines = (stationIds: ReadonlyArray<string>): Array<StationOnLine> =>
    stationIds.flatMap((id): Array<StationOnLine> => {
      const line = getLineOfStation(id)
      return line ? [{ stationId: String(id), line }] : []
    })

  /** Уникальные линии узла. Нужна, когда важны только значки. */
  const getNodeLines = (stationIds: ReadonlyArray<string>): Array<Line> => {
    const unique = new Map<string, Line>()
    for (const { line } of getStationLines(stationIds)) unique.set(String(line.id), line)
    return [...unique.values()]
  }

  return { getLineOfStation, getStationLines, getNodeLines }
}
