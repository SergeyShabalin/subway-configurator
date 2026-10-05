import { graphService, stationsService } from '@/src/lib/services'
import type { Line, Segment, Station, Visual } from '@/types/metro'
import { create } from 'zustand'

interface MetroState {
  stations: Array<Station>
  segments: Array<Segment>
  lines: Array<Line>
  visuals: Array<Visual>
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

export const useMetroStore = create<MetroState>((set) => ({
  stations: [],
  segments: [],
  lines: [],
  visuals: [],
  visualToStations: {},
  selectedStationId: null,
  isDragging: false,
  mode: 'view',
  isLoading: false,
  error: null,

  setSelectedStation: (id) => set({ selectedStationId: id }),
  setMode: (mode) => set({ mode }),
  setDragging: (isDragging) => set({ isDragging }),

  loadData: async () => {
    set({ isLoading: true, error: null })

    try {
      const data = await graphService.getGraph()

      const stations: Array<Station> = data.stations.map((s) => ({
        id: s.id,
        name: s.name,
        line_id: s.lineId,
      }))

      const segments: Array<Segment> = data.segments.map((s) => ({
        id: s.id,
        from_station_id: s.fromStationId,
        to_station_id: s.toStationId,
        time_minutes: s.timeMinutes,
      }))

      const lines: Array<Line> = data.lines.map((l) => ({
        id: l.id,
        name: l.name,
        color: l.color,
        is_circular: l.isCircular ? 1 : 0,
        visualStationIds: l.visualStationIds,
        logicalStationIds: l.logicalStationIds,
      }))

      const visuals: Array<Visual> = data.visuals.map((v) => ({
        id: v.id,
        x: v.x,
        y: v.y,
        label_x: v.labelOffset.x,
        label_y: v.labelOffset.y,
        is_transfer: v.isTransfer ? 1 : 0,
      }))

      set({
        stations,
        segments,
        lines,
        visuals,
        visualToStations: data.visualToStations,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      })
    }
  },

  saveVisualPosition: async (visualId, x, y) => {
    try {
      await stationsService.updateVisualPosition(visualId, x, y)

      set((state) => ({
        visuals: state.visuals.map((v) => (v.id === visualId ? { ...v, x, y } : v)),
      }))
    } catch (error) {
      console.error('Failed to save visual position:', error)
    }
  },
}))
