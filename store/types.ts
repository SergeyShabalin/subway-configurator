import type { StateCreator } from 'zustand'
import type { GraphSlice } from './slices/graphSlice'
import type { LayoutSlice } from './slices/layoutSlice'
import type { LoaderSlice } from './slices/loaderSlice'
import type { RouteSlice } from './slices/routeSlice'
import type { UiSlice } from './slices/uiSlice'

/**
 * Полный стор приложения: объединение всех слайсов.
 *
 * Новый слайс добавляется в три места: файл в `slices/`, этот тип и `createMetroStore`.
 * Существующие слайсы при этом не меняются.
 */
export type MetroStore = GraphSlice & LayoutSlice & LoaderSlice & RouteSlice & UiSlice

/**
 * Тип фабрики слайса.
 *
 * - `Own`: что слайс создаёт (его состояние и действия).
 * - `Deps`: что он имеет право использовать из других слайсов. По умолчанию ничего,
 *   поэтому попытка прочитать чужое поле без объявления зависимости не скомпилируется.
 */
export type SliceCreator<Own, Deps = unknown> = StateCreator<Own & Deps, [], [], Own>
