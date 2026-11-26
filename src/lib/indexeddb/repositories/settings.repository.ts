import type { MapStyles } from '@/types/metro'
import { BaseRepository } from './base.repository'

export interface StylesRecord extends MapStyles {
  id: string
}

const STYLES_ID = 'styles'

const hasStyles = (styles: MapStyles) => Object.keys(styles).length > 0

export class SettingsRepository extends BaseRepository<StylesRecord> {
  protected storeName = 'settings'

  getStyles() {
    return this.getById(STYLES_ID)
  }

  /** Пустые стили удаляют запись, любая заданная секция (шрифты, толщина линий) сохраняется. */
  saveStyles(styles: MapStyles) {
    return hasStyles(styles) ? this.save({ id: STYLES_ID, ...styles }) : this.delete(STYLES_ID)
  }
}

export const settingsRepo = new SettingsRepository()
