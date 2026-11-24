import { createSettingsSlice } from '@/store/slices/settingsSlice'
import { createStore } from 'zustand/vanilla'
import { createGraphSlice } from './slices/graphSlice'
import { createLayoutSlice } from './slices/layoutSlice'
import { createLoaderSlice, type GraphSource } from './slices/loaderSlice'
import { createRouteSlice } from './slices/routeSlice'
import { createStyleSlice } from './slices/styleSlice'
import { createUiSlice } from './slices/uiSlice'
import type { MetroStore } from './types'

/** Начальное состояние для тестов, Storybook или гидрации. */
export type MetroInitState = Partial<MetroStore>

export const createMetroStore = (source: GraphSource, initState: MetroInitState = {}) =>
  createStore<MetroStore>()((...args) => ({
    ...createGraphSlice(...args),
    ...createLayoutSlice(...args),
    ...createLoaderSlice(source)(...args),
    ...createRouteSlice(...args),
    ...createStyleSlice(...args),
    ...createUiSlice(...args),
    ...createSettingsSlice(...args),
    ...initState,
  }))

export type MetroStoreApi = ReturnType<typeof createMetroStore>
