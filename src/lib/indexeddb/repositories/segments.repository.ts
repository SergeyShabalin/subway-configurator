import type { Segment } from '@/types/metro'
import { BaseRepository } from './base.repository'

export class SegmentsRepository extends BaseRepository<Segment> {
  protected storeName = 'segments'

  async getByStationId(stationId: string): Promise<Array<Segment>> {
    const all = await this.getAll()
    return all.filter(
      (segment) => segment.from_station_id === stationId || segment.to_station_id === stationId
    )
  }

  async getByLineId(lineId: string): Promise<Array<Segment>> {
    const all = await this.getAll()
    return all.filter((segment) => segment.line_id === lineId)
  }
}

export const segmentsRepo = new SegmentsRepository()
