import { graphService } from '@/src/lib/services'
import type { Line, Segment, Station, VisualStation, VisualTransfer } from '@/types/metro'
import { create } from 'zustand'

interface MetroState {
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
  setSelectedStation: (id: string | null) => void
  setMode: (mode: 'view' | 'edit' | 'route') => void
  setDragging: (isDragging: boolean) => void
  updateVisualPosition: (visualId: string, x: number, y: number) => void
  updateVisualLabelOffset: (visualId: string, labelX: number, labelY: number) => void
  loadData: () => Promise<void>
}

export const useMetroStore = create<MetroState>((set) => ({
  stations: [],
  segments: [],
  lines: [],
  visuals: {},
  visualToStations: {},
  visualTransfers: [],
  selectedStationId: null,
  isDragging: false,
  mode: 'view',
  isLoading: false,
  error: null,

  setSelectedStation: (id) => set({ selectedStationId: id }),
  setMode: (mode) => set({ mode }),
  setDragging: (isDragging) => set({ isDragging }),

  updateVisualPosition: (visualId, x, y) =>
    set((state) => {
      const current = state.visuals[visualId]
      if (!current) return state

      return {
        visuals: {
          ...state.visuals,
          [visualId]: { ...current, x, y },
        },
      }
    }),

  updateVisualLabelOffset: (visualId, labelX, labelY) =>
    set((state) => {
      const current = state.visuals[visualId]
      if (!current) return state

      return {
        visuals: {
          ...state.visuals,
          [visualId]: { ...current, labelOffset: { x: labelX, y: labelY } },
        },
      }
    }),

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
        line_id: s.lineId ?? '',
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

      const visuals: Record<string, VisualStation> = {}

      for (const v of data.visuals) {
        visuals[v.id] = {
          id: v.id,
          x: v.x,
          y: v.y,
          labelOffset: {
            x: v.labelOffset?.x ?? 0,
            y: v.labelOffset?.y ?? -60,
          },
          connections: v.connections ?? [],
          displayMode: v.displayMode ?? 'single',
          is_transfer: v.isTransfer ? 1 : 0,
        }
      }

      const visualTransfers: Array<VisualTransfer> = data.visualTransfers.map((t) => ({
        id: t.id,
        from_visual_id: t.fromVisualId,
        to_visual_id: t.toVisualId,
        time_minutes: t.timeMinutes,
        style: (t.style as VisualTransfer['style']) ?? 'dashed',
      }))

      set({
        stations,
        segments,
        lines,
        visuals,
        visualToStations: data.visualToStations,
        visualTransfers,
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
}))
