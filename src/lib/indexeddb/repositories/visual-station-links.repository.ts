import type { VisualStationLink } from '@/types/metro'
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
}

export const visualStationLinksRepo = new VisualStationLinksRepository()
