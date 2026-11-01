import type { Line, Segment, Station, VisualStation, VisualTransfer } from '@/types/metro'

export interface MetroState {
  stations: Array<Station>
  segments: Array<Segment>
  lines: Array<Line>
  visuals: Record<string, VisualStation>
  visualToStations: Record<string, Array<string>>
  visualTransfers: Array<VisualTransfer>
  selectedStationId: string | null
  isDragging: boolean
  mode: 'view' | 'edit' | 'route'
  isLoading: boolean
  error: string | null
  routeFromId: string
  routeToId: string
  setSelectedStation: (id: string | null) => void
  setMode: (mode: 'view' | 'edit' | 'route') => void
  setDragging: (isDragging: boolean) => void
  setRoutePoints: (fromId: string, toId: string) => void
  updateVisualPosition: (visualId: string, x: number, y: number) => void
  updateVisualLabelOffset: (visualId: string, labelX: number, labelY: number) => void
  loadData: () => Promise<void>
  routeAlternativeIndex: number
  setRouteAlternativeIndex: (index: number) => void
}

export interface ApiResponse {
  stations: Array<Station>
  segments: Array<Segment>
  lines: Array<Line>
  visualToStations: Record<string, Array<string>>
}
