import type { VisualStation } from '@/types/metro'
import { create } from 'zustand'

interface VisualsState {
  visuals: Record<string, VisualStation>
  setVisuals: (visuals: Array<VisualStation>) => void
  updateVisualPosition: (id: string, x: number, y: number) => void
}

export const useVisualsStore = create<VisualsState>((set) => ({
  visuals: {},

  setVisuals: (visuals) => {
    const visualsMap: Record<string, VisualStation> = {}
    for (const v of visuals) {
      visualsMap[v.id] = v
    }
    set({ visuals: visualsMap })
  },

  updateVisualPosition: (id, x, y) =>
    set((state) => {
      const existing = state.visuals[id]
      if (!existing) return state

      return {
        visuals: {
          ...state.visuals,
          [id]: { ...existing, x, y },
        },
      }
    }),
}))
