import type { BadgeEnd, Line, Point, Segment, Station, VisualTransfer } from '@/types/metro'
import type { MetroStore, SliceCreator } from '../types'

/** Данные графа без раскладки (раскладка хранится в layoutSlice). */
export interface GraphEntities {
  stations: Array<Station>
  segments: Array<Segment>
  lines: Array<Line>
  visualToStations: Record<string, Array<string>>
  visualTransfers: Array<VisualTransfer>
}

/**
 * Слайс графа: логическая модель метро.
 *
 * Назначение:
 *   Хранение станций, линий, перегонов, пересадок, связи «визуал → станции»
 *   и индексов по id для быстрого поиска.
 *
 * Хранить здесь:
 *   - свойства станции (название, код, год открытия и т. п.)
 *   - свойства линии (цвет, тип, порядок станций)
 *   - время перегонов и пересадок
 *
 * Не хранить здесь:
 *   - координаты и смещение подписей: `layoutSlice`
 *   - статус загрузки и ошибки: `loaderSlice`
 *   - выбранные станции и режимы: `uiSlice`
 *
 * Типичные правки:
 *   - Новое поле станции или линии: изменений в слайсе нет, поле добавляется
 *     в типы, сервис, `graphService` и `mapGraph` (подробнее в `MetroStore`).
 *   - Локальное обновление без перезагрузки: добавить действие вида
 *     `updateStation(id, patch)` и пересобрать соответствующий индекс.
 *
 * Зависимости: нет.
 * Частота изменений: низкая, данные заменяются целиком при загрузке.
 * Единственный источник данных: `loaderSlice` через `setGraph`.
 */
export interface GraphSlice extends GraphEntities {
  /** Индекс станций по id. Строится в `setGraph`, поиск за O(1) вместо `stations.find`. */
  stationsById: Record<string, Station>
  /** Индекс линий по id. Строится в `setGraph`. */
  linesById: Record<string, Line>
  /** Замена всего графа и пересборка индексов. */
  setGraph: (graph: GraphEntities) => void
  updateLineBadgeOffset: (lineId: string, end: BadgeEnd, offset: Point) => void
}

const indexById = <T extends { id: string }>(items: ReadonlyArray<T>): Record<string, T> => {
  const index: Record<string, T> = {}
  for (const item of items) index[item.id] = item
  return index
}

export const createGraphSlice: SliceCreator<GraphSlice, MetroStore> = (set) => ({
  stations: [],
  segments: [],
  lines: [],
  visualToStations: {},
  visualTransfers: [],
  stationsById: {},
  linesById: {},

  setGraph: (graph) =>
    set({
      ...graph,
      stationsById: indexById(graph.stations),
      linesById: indexById(graph.lines),
    }),
  updateLineBadgeOffset: (lineId, end, offset) =>
    set((state) => {
      const line = state.linesById[lineId]
      if (!line) return state

      const updated: Line = {
        ...line,
        badgeOffsets: {
          ...(line.badgeOffsets ?? {}),
          [end]: offset,
        },
      }

      return {
        lines: state.lines.map((l) => (l.id === lineId ? updated : l)),
        linesById: { ...state.linesById, [lineId]: updated },
      }
    }),
})
