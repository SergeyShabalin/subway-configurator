import {
  linesRepo,
  segmentsRepo,
  stationsRepo,
  visualsRepo,
  visualStationLinksRepo,
} from '@/src/lib/indexeddb/repositories'
import type { Segment, Station } from '@/types/metro'
import { BaseService } from './base.service'

export class StationsService extends BaseService {
  async getAll(): Promise<Array<Station>> {
    try {
      return await stationsRepo.getAll()
    } catch (error) {
      return this.handleError(error, 'StationsService.getAll')
    }
  }

  async createWithSegment(data: {
    name: string
    lineId: string
    x: number
    y: number
    timeMinutes: number
  }): Promise<{ station: Station; visualId: string; segment?: Segment }> {
    try {
      const result = await this.create({
        name: data.name,
        lineId: data.lineId,
        x: data.x,
        y: data.y,
      })

      const allStations = await stationsRepo.getAll()
      const lineStations = allStations
        .filter((s) => s.line_id === data.lineId)
        .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0))

      let segment: Segment | undefined
      if (lineStations.length > 1 && data.timeMinutes > 0) {
        const previousStation = lineStations[lineStations.length - 2]

        if (previousStation) {
          segment = {
            id: this.generateId(),
            from_station_id: previousStation.id,
            to_station_id: result.station.id,
            line_id: data.lineId,
            time_minutes: data.timeMinutes,
          }
          await segmentsRepo.save(segment)
        }
      }

      return {
        station: result.station,
        visualId: result.visualId,
        segment,
      }
    } catch (error) {
      return this.handleError(error, 'StationsService.createWithSegment')
    }
  }

  async create(data: {
    name: string
    lineId: string
    x: number
    y: number
  }): Promise<{ station: Station; visualId: string }> {
    try {
      const stationId = this.generateId()
      const visualId = this.generateId()

      const newStation: Station = {
        id: stationId,
        name: data.name,
        line_id: data.lineId,
        createdAt: Date.now(),
      }
      await stationsRepo.save(newStation)

      await visualsRepo.save({
        id: visualId,
        x: data.x,
        y: data.y,
        label_x: 0,
        label_y: -40,
        is_transfer: 0,
      })

      await visualStationLinksRepo.save({
        id: `${visualId}:${stationId}`,
        visual_id: visualId,
        station_id: stationId,
      })

      const line = await linesRepo.getById(data.lineId)
      if (line) {
        const visualStationIds = line.visualStationIds ?? []
        const logicalStationIds = line.logicalStationIds ?? []

        await linesRepo.update(data.lineId, {
          visualStationIds: [...visualStationIds, visualId],
          logicalStationIds: [...logicalStationIds, stationId],
        })
      }

      return { station: newStation, visualId }
    } catch (error) {
      return this.handleError(error, 'StationsService.create')
    }
  }

  async updateVisualPosition(visualId: string, x: number, y: number): Promise<void> {
    try {
      await visualsRepo.updatePosition(visualId, x, y)
    } catch (error) {
      return this.handleError(error, 'StationsService.updateVisualPosition')
    }
  }
}

export const stationsService = new StationsService()
