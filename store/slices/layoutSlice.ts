import type { VisualStation } from '@/types/metro'
import type { SliceCreator } from '../types'

export interface VisualPositionUpdate {
  id: string
  x: number
  y: number
}

/**
 * Слайс раскладки: расположение элементов метро на холсте.
 *
 * Назначение:
 *   Хранение координат визуальных станций и смещений их подписей.
 *
 * Хранить здесь:
 *   - позицию станции (x, y)
 *   - смещение подписи относительно станции
 *   - любые другие свойства отрисовки, привязанные к визуалу (режим отображения, размер)
 *
 * Не хранить здесь:
 *   - название станции и другие логические свойства: `graphSlice`
 *   - сохранение в БД: сервисы (`visualsService`) и хуки
 *   - признак «идёт перетаскивание»: `uiSlice`
 *
 * Типичные правки:
 *   - Новое свойство отрисовки станции: добавить поле в `VisualStation`,
 *     в `mapGraph` и при необходимости новое действие `updateVisual…` в этот слайс.
 *
 * Зависимости: нет.
 * Частота изменений: очень высокая, обновление на каждом шаге перетаскивания.
 *
 * Правила чтения:
 *   - В рендере подписываться только там, где `visuals` действительно нужен.
 *   - В обработчиках событий читать через `useMetroStoreApi().getState()`, без подписки.
 */
export interface LayoutSlice {
  visuals: Record<string, VisualStation>
  /** Замена всей раскладки. Вызывается из `loaderSlice` после загрузки. */
  setVisuals: (visuals: Record<string, VisualStation>) => void
  /** Перемещение одной станции. Частный случай `updateVisualPositions`. */
  updateVisualPosition: (visualId: string, x: number, y: number) => void
  /** Перемещение нескольких станций за одно обновление стора (например, выравнивание). */
  updateVisualPositions: (items: ReadonlyArray<VisualPositionUpdate>) => void
  /** Изменение смещения подписи относительно станции. */
  updateVisualLabelOffset: (visualId: string, labelX: number, labelY: number) => void
}

export const createLayoutSlice: SliceCreator<LayoutSlice> = (set, get) => ({
  visuals: {},

  setVisuals: (visuals) => set({ visuals }),

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
