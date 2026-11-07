import type { GraphData } from '@/types/metro'
import { mapGraph } from '../mappers/mapGraph'
import type { SliceCreator } from '../types'
import type { GraphSlice } from './graphSlice'
import type { LayoutSlice } from './layoutSlice'

/** Источник данных графа. Стор зависит от интерфейса, а не от конкретного сервиса. */
export interface GraphSource {
  getGraph: () => Promise<GraphData>
}

/**
 * Слайс загрузки: получение данных и отражение статуса.
 *
 * Назначение:
 *   Запрос к источнику, преобразование ответа через `mapGraph`, раздача данных
 *   по `graphSlice` и `layoutSlice`, учёт `isLoading` и `error`.
 *
 * Хранить здесь:
 *   - статус загрузки (`isLoading`) и текст ошибки (`error`)
 *   - действия, запускающие загрузку
 *
 * Не хранить здесь:
 *   - сами данные графа: они принадлежат `graphSlice` и `layoutSlice`
 *   - логику преобразования DTO: `mappers/mapGraph.ts`
 *
 * Типичные правки:
 *   - Изменение формата ответа бэкенда: править `mapGraph`, а не этот слайс.
 *   - Другой источник данных (API, мок): передать другой `GraphSource` в провайдер.
 *   - Частичная перезагрузка (только линии): добавить отдельное действие рядом с `loadData`.
 *
 * Зависимости: `GraphSlice` (`setGraph`) и `LayoutSlice` (`setVisuals`).
 * Источник данных внедряется параметром фабрики, в тестах подставляется мок.
 *
 * Компонентам, которым нужно только запустить перезагрузку, подходит `useGraphActions`:
 * подписки на `isLoading` и `error` не создаются.
 */
export interface LoaderSlice {
  isLoading: boolean
  error: string | null
  /** Повторная загрузка графа. Ошибка не пробрасывается, а записывается в `error`. */
  loadData: () => Promise<void>
}

export const createLoaderSlice =
  (source: GraphSource): SliceCreator<LoaderSlice, GraphSlice & LayoutSlice> =>
  (set, get) => ({
    isLoading: false,
    error: null,

    loadData: async () => {
      set({ isLoading: true, error: null })

      try {
        const { visuals, ...graph } = mapGraph(await source.getGraph())

        get().setGraph(graph)
        get().setVisuals(visuals)
        set({ isLoading: false })
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Unknown error',
          isLoading: false,
        })
      }
    },
  })
