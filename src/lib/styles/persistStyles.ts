import { settingsRepo } from '@/src/lib/indexeddb/repositories/settings.repository'
import type { MapStyles } from '@/types/metro'

const PERSIST_DELAY_MS = 300
let timer: ReturnType<typeof setTimeout> | undefined

/** Запись в IndexedDB с debounce, чтобы ползунок не писал в базу на каждый шаг. */
export const persistStyles = (styles: MapStyles) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    settingsRepo.saveStyles(styles).catch((e) => console.error('Save styles failed:', e))
  }, PERSIST_DELAY_MS)
}
