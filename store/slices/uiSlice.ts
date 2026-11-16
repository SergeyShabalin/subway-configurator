import type { SliceCreator } from '../types'

export type MetroMode = 'view' | 'edit' | 'route'

/**
 * Слайс интерфейса: временное состояние взаимодействия с картой.
 *
 * Назначение:
 *   Хранение режима работы, выбранной станции и признака перетаскивания.
 *
 * Хранить здесь:
 *   - всё, что относится к текущему сеансу и сбрасывается при перезагрузке страницы
 *   - режим (`mode`), выбор (`selectedStationId`), флаги состояния (`isDragging`)
 *   - линию, выбранную для переноса за сегмент (`movableLineId`)
 *
 * Не хранить здесь:
 *   - данные, которые должны пережить перезагрузку: `graphSlice` и `layoutSlice` через БД
 *   - локальное состояние одного компонента (открыта ли модалка, значение поля формы):
 *     оставлять в `useState` этого компонента
 *
 * Типичные правки:
 *   - Новый режим карты: добавить значение в `MetroMode`.
 *   - Новый флаг интерфейса, нужный нескольким компонентам: добавить поле и действие сюда.
 *
 * Зависимости: нет.
 * Частота изменений: средняя, по действиям пользователя.
 */
export interface UiSlice {
  selectedStationId: string | null
  /** true, пока станция перетаскивается. Подходит для отключения тяжёлых эффектов. */
  isDragging: boolean
  mode: MetroMode
  /** Линия, которую можно переносить за сегмент. null: режим переноса выключен. */
  movableLineId: string | null
  setSelectedStation: (id: string | null) => void
  setMode: (mode: MetroMode) => void
  setDragging: (isDragging: boolean) => void
  setMovableLineId: (lineId: string | null) => void
}

export const createUiSlice: SliceCreator<UiSlice> = (set) => ({
  selectedStationId: null,
  isDragging: false,
  mode: 'view',
  movableLineId: null,

  setSelectedStation: (id) => set({ selectedStationId: id }),
  setMode: (mode) => set({ mode }),
  setDragging: (isDragging) => set({ isDragging }),
  setMovableLineId: (lineId) => set({ movableLineId: lineId }),
})
