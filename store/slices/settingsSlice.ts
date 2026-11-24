import type { SliceCreator } from '../types'

/**
 * Слайс пользовательских настроек интерфейса.
 *
 * Хранить здесь: переключатели поведения, не влияющие на данные схемы.
 * Состояние живёт только в памяти: после перезагрузки возвращается к значениям по умолчанию.
 *
 * Зависимости: нет.
 */
export interface SettingsSlice {
  /** Можно ли перетаскивать станции, подписи и бейджи линий. По умолчанию выключено. */
  isDragEnabled: boolean
  setDragEnabled: (isDragEnabled: boolean) => void
}

export const createSettingsSlice: SliceCreator<SettingsSlice> = (set) => ({
  isDragEnabled: false,

  setDragEnabled: (isDragEnabled) => set({ isDragEnabled }),
})
