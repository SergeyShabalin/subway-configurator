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

  async getByFromStationId(fromStationId: string): Promise<Array<Segment>> {
    const all = await this.getAll()
    return all.filter((segment) => segment.from_station_id === fromStationId)
  }

  async getByToStationId(toStationId: string): Promise<Array<Segment>> {
    const all = await this.getAll()
    return all.filter((segment) => segment.to_station_id === toStationId)
  }

  async getBetweenStations(fromId: string, toId: string): Promise<Segment | undefined> {
    const all = await this.getAll()
    return all.find(
      (segment) =>
        (segment.from_station_id === fromId && segment.to_station_id === toId) ||
        (segment.from_station_id === toId && segment.to_station_id === fromId)
    )
  }
}

export const segmentsRepo = new SegmentsRepository()
