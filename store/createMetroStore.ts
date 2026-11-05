import { createStore } from 'zustand/vanilla'
import { createDataSlice, type GraphSource } from './slices/dataSlice'
import { createRouteSlice } from './slices/routeSlice'
import { createUiSlice } from './slices/uiSlice'
import { createVisualSlice } from './slices/visualSlice'
import type { MetroStore } from './types'

/** Начальное состояние для тестов, Storybook или гидрации. */
export type MetroInitState = Partial<MetroStore>

export const createMetroStore = (source: GraphSource, initState: MetroInitState = {}) =>
  createStore<MetroStore>()((...args) => ({
    ...createDataSlice(source)(...args),
    ...createRouteSlice(...args),
    ...createUiSlice(...args),
    ...createVisualSlice(...args),
    ...initState,
  }))

export type MetroStoreApi = ReturnType<typeof createMetroStore>
