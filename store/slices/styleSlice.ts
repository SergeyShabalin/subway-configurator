import { persistStyles } from '@/src/lib/styles/persistStyles'
import {
  clearAllLines,
  clearLabels,
  clearLine,
  compactStyles,
  mergeLabels,
  withLineValue,
} from '@/src/lib/styles/styleOperations'
import type { LabelStyle, MapStyles } from '@/types/metro'
import type { SliceCreator } from '../types'

/**
 * Слайс стилей карты.
 *
 * Хранить здесь: только заданные пользователем поля стиля, остальное берётся из темы.
 * Логика преобразований лежит в `styleOperations`, сохранение в `persistStyles`.
 *
 * Зависимости: нет.
 */
export interface StyleSlice {
  styles: MapStyles
  /** Замена стилей целиком (загрузка из БД). В БД не пишет. */
  setStyles: (styles: MapStyles) => void
  /** Передайте `undefined` в поле, чтобы сбросить его к значению темы. */
  updateLabelStyle: (patch: LabelStyle) => void
  resetLabelStyle: () => void
  /** Множитель толщины линии. `undefined` сбрасывает линию к толщине по умолчанию. */
  updateLineWidth: (lineId: string, scale: number | undefined) => void
  /** Множитель кривизны линии (0 — прямые углы). `undefined` сбрасывает к значению по умолчанию. */
  updateLineCurvature: (lineId: string, scale: number | undefined) => void
  /** Сбрасывает толщину и кривизну одной линии. */
  resetLineStyle: (lineId: string) => void
  /** Сбрасывает толщину и кривизну всех линий. */
  resetLineStyles: () => void
}

export const createStyleSlice: SliceCreator<StyleSlice> = (set, get) => {
  const commit = (transform: (styles: MapStyles) => MapStyles) => {
    const next = compactStyles(transform(get().styles))
    set({ styles: next })
    persistStyles(next)
  }

  return {
    styles: {},

    setStyles: (styles) => set({ styles }),

    updateLabelStyle: (patch) => commit((s) => mergeLabels(s, patch)),
    resetLabelStyle: () => commit(clearLabels),

    updateLineWidth: (lineId, scale) =>
      commit((s) => withLineValue(s, 'lineWidths', lineId, scale)),
    updateLineCurvature: (lineId, scale) =>
      commit((s) => withLineValue(s, 'lineCurvature', lineId, scale)),
    resetLineStyle: (lineId) => commit((s) => clearLine(s, lineId)),
    resetLineStyles: () => commit(clearAllLines),
  }
}
