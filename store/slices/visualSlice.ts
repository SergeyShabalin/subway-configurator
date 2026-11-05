import type { SliceCreator } from '../types'

export interface VisualPositionUpdate {
  id: string
  x: number
  y: number
}

export interface VisualSlice {
  updateVisualPosition: (visualId: string, x: number, y: number) => void
  updateVisualPositions: (items: ReadonlyArray<VisualPositionUpdate>) => void
  updateVisualLabelOffset: (visualId: string, labelX: number, labelY: number) => void
}

export const createVisualSlice: SliceCreator<VisualSlice> = (set, get) => ({
  // Частный случай пакетного обновления
  updateVisualPosition: (visualId, x, y) => get().updateVisualPositions([{ id: visualId, x, y }]),

  updateVisualPositions: (items) =>
    set((state) => {
      const visuals = { ...state.visuals }

      for (const { id, x, y } of items) {
        const current = visuals[id]
        if (current) visuals[id] = { ...current, x, y }
      }

      return { visuals }
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
})
