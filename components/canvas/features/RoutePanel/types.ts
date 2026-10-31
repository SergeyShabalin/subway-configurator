export interface StationOption {
  id: string
  label: string
  name: string
}

export interface RouteLeg {
  lineId: string
  lineName: string
  lineColor: string
  stationNames: Array<string>
  stationIds: Array<string>
  minutes: number
  transferMinutesBefore: number
}

export interface RouteResult {
  totalMinutes: number
  transfersCount: number
  legs: Array<RouteLeg>
}
