import type { SliceCreator } from '../types'

export type MetroMode = 'view' | 'edit' | 'route'

export interface UiSlice {
  selectedStationId: string | null
  isDragging: boolean
  mode: MetroMode
  setSelectedStation: (id: string | null) => void
  setMode: (mode: MetroMode) => void
  setDragging: (isDragging: boolean) => void
}

export const createUiSlice: SliceCreator<UiSlice> = (set) => ({
  selectedStationId: null,
  isDragging: false,
  mode: 'view',

  setSelectedStation: (id) => set({ selectedStationId: id }),
  setMode: (mode) => set({ mode }),
  setDragging: (isDragging) => set({ isDragging }),
})
