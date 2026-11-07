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
