import type { Line, Segment, Station } from '@/store'

export interface MetroState {
  stations: Array<Station>
  segments: Array<Segment>
  lines: Array<Line>
  visualToStations: Record<string, Array<string>>
  selectedStationId: string | null
  isDragging: boolean
  mode: 'view' | 'edit' | 'route'
  isLoading: boolean
  error: string | null
  setSelectedStation: (id: string | null) => void
  setMode: (mode: 'view' | 'edit' | 'route') => void
  setDragging: (isDragging: boolean) => void
  loadData: () => Promise<void>
  saveVisualPosition: (visualId: string, x: number, y: number) => Promise<void>
}

export interface ApiResponse {
  stations: Array<Station>
  segments: Array<Segment>
  lines: Array<Line>
  visualToStations: Record<string, Array<string>>
}
