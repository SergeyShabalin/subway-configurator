import type { MapStyles } from '@/types/metro'
import { BaseRepository } from './base.repository'

export interface StylesRecord extends MapStyles {
  id: string
}

const STYLES_ID = 'styles'

export class SettingsRepository extends BaseRepository<StylesRecord> {
  protected storeName = 'settings'

  getStyles() {
    return this.getById(STYLES_ID)
  }

  saveStyles(styles: MapStyles) {
    return styles.labels ? this.save({ id: STYLES_ID, ...styles }) : this.delete(STYLES_ID)
  }
}

export const settingsRepo = new SettingsRepository()
