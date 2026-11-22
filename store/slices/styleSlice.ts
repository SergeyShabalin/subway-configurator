import { settingsRepo } from '@/src/lib/indexeddb/repositories/settings.repository'
import type { LabelStyle, MapStyles } from '@/types/metro'
import type { SliceCreator } from '../types'

/**
 * Слайс стилей карты.
 *
 * Хранить здесь: только заданные пользователем поля стиля, остальное берётся из темы.
 * Запись в IndexedDB идёт с debounce, чтобы ползунок не писал в базу на каждый шаг.
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
}

const PERSIST_DELAY_MS = 300
let timer: ReturnType<typeof setTimeout> | undefined

const persist = (styles: MapStyles) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    settingsRepo.saveStyles(styles).catch((e) => console.error('Save styles failed:', e))
  }, PERSIST_DELAY_MS)
}

const compact = (labels: LabelStyle): MapStyles => {
  const entries = Object.entries(labels).filter(([, v]) => v !== undefined)
  return entries.length ? { labels: Object.fromEntries(entries) as LabelStyle } : {}
}

export const createStyleSlice: SliceCreator<StyleSlice> = (set, get) => ({
  styles: {},

  setStyles: (styles) => set({ styles }),

  updateLabelStyle: (patch) => {
    const styles = compact({ ...get().styles.labels, ...patch })
    set({ styles })
    persist(styles)
  },

  resetLabelStyle: () => {
    set({ styles: {} })
    persist({})
  },
})
