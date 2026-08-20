import { segmentsRepo } from '@/src/lib/indexeddb/repositories'
import type { Segment } from '@/types/metro'
import { BaseService } from './base.service'

export class SegmentsService extends BaseService {
  async getAll(): Promise<Array<Segment>> {
    try {
      return await segmentsRepo.getAll()
    } catch (error) {
      return this.handleError(error, 'SegmentsService.getAll')
    }
  }

  async create(data: {
    fromStationId: string
    toStationId: string
    timeMinutes: number
  }): Promise<Segment> {
    try {
      const id = `segment-${data.fromStationId}-${data.toStationId}`
      const newSegment: Segment = {
        id,
        from_station_id: data.fromStationId,
        to_station_id: data.toStationId,
        time_minutes: data.timeMinutes,
      }
      await segmentsRepo.save(newSegment)
      return newSegment
    } catch (error) {
      return this.handleError(error, 'SegmentsService.create')
    }
  }
}

export const segmentsService = new SegmentsService()
