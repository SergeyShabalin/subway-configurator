import { ApiResponse, MetroState } from '@/store/hooks/useMetroStore/types'
import { create } from 'zustand'

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
      const response = await fetch('/api/graph')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = (await response.json()) as ApiResponse

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
      const response = await fetch(`/api/visuals/${visualId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to save visual position:', error)
    }
  },
}))
