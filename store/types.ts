import type { StateCreator } from 'zustand'
import type { DataSlice } from './slices/dataSlice'
import type { RouteSlice } from './slices/routeSlice'
import type { UiSlice } from './slices/uiSlice'
import type { VisualSlice } from './slices/visualSlice'

export type MetroStore = DataSlice & RouteSlice & UiSlice & VisualSlice

export type SliceCreator<T> = StateCreator<MetroStore, [], [], T>
