import { DEFAULT_INTERCHANGE_MINUTES } from '../constants'
import type { BuildGraphInput, Edge, RouteGraph } from '../types'

const toMinutes = (value: number): number => (Number.isFinite(value) && value > 0 ? value : 0)

export const buildRouteGraph = ({
  segments,
  visualToStations,
  visualTransfers,
  interchangeMinutes = DEFAULT_INTERCHANGE_MINUTES,
}: BuildGraphInput): RouteGraph => {
  const adjacency = new Map<string, Array<Edge>>()
  const stationToVisual = new Map<string, string>()

  const connect = (
    a: string,
    b: string,
    minutes: number,
    kind: Edge['kind'],
    lineId: string | null
  ) => {
    const fromA = adjacency.get(a) ?? []
    fromA.push({ to: b, minutes, kind, lineId })
    adjacency.set(a, fromA)

    const fromB = adjacency.get(b) ?? []
    fromB.push({ to: a, minutes, kind, lineId })
    adjacency.set(b, fromB)
  }

  for (const [visualId, stationIds] of Object.entries(visualToStations)) {
    for (const id of stationIds) stationToVisual.set(id, visualId)

    for (let i = 0; i < stationIds.length; i++) {
      for (let j = i + 1; j < stationIds.length; j++) {
        connect(stationIds[i], stationIds[j], interchangeMinutes, 'transfer', null)
      }
    }
  }

  for (const segment of segments) {
    connect(
      segment.from_station_id,
      segment.to_station_id,
      toMinutes(segment.time_minutes),
      'ride',
      String(segment.line_id)
    )
  }

  for (const transfer of visualTransfers) {
    const fromStations = visualToStations[transfer.from_visual_id] ?? []
    const toStations = visualToStations[transfer.to_visual_id] ?? []

    for (const a of fromStations) {
      for (const b of toStations) {
        connect(a, b, toMinutes(transfer.time_minutes), 'transfer', null)
      }
    }
  }

  return { adjacency, stationToVisual, visualToStations }
}
