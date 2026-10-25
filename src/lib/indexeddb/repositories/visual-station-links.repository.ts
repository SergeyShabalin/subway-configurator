import type { VisualStationLink } from '@/types/metro'
import { db } from '../db'
import { BaseRepository } from './base.repository'

export class VisualStationLinksRepository extends BaseRepository<VisualStationLink> {
  protected storeName = 'visual_station_links'

  async getByVisualId(visualId: string): Promise<Array<VisualStationLink>> {
    const all = await this.getAll()
    return all.filter((link) => link.visual_id === visualId)
  }

  async getByStationId(stationId: string): Promise<Array<VisualStationLink>> {
    const all = await this.getAll()
    return all.filter((link) => link.station_id === stationId)
  }

  // Хранилище создано с keyPath ['visual_id', 'station_id'], поэтому удаляем по составному ключу
  async deleteLink(link: VisualStationLink): Promise<void> {
    return db.delete(this.storeName, [link.visual_id, link.station_id])
  }
}

export const visualStationLinksRepo = new VisualStationLinksRepository()
