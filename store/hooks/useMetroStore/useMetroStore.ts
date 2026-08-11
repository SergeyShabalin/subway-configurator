// store/hooks/useMetroStore/useMetroStore.tsx
import { graphService, stationsService } from '@/lib/services'
import type { Line, Segment, Station } from '@/store/types'
import { create } from 'zustand'

interface MetroState {
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

export const useMetroStore = create<MetroState>((set, _get) => ({
  stations: [],
  segments: [],
  lines: [],
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

      set({
        stations: data.stations,
        segments: data.segments,
        lines: data.lines,
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
    } catch (error) {
      console.error('Failed to save visual position:', error)
    }
  },
}))
