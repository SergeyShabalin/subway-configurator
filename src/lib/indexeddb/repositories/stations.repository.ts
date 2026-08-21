import type { Station } from '@/types/metro'
import { BaseRepository } from './base.repository'

export class StationsRepository extends BaseRepository<Station> {
  protected storeName = 'stations'

  async getByLineId(lineId: string): Promise<Array<Station>> {
    const all = await this.getAll()
    return all.filter((station) => station.line_id === lineId)
  }

  async getByName(name: string): Promise<Array<Station>> {
    const all = await this.getAll()
    return all.filter((station) => station.name.includes(name))
  }
}

export const stationsRepo = new StationsRepository()
