import { create } from 'zustand'
import type { VisualStation } from './types'

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
    set((state) => ({
      visuals: {
        ...state.visuals,
        [id]: { ...state.visuals[id], x, y },
      },
    })),
}))
