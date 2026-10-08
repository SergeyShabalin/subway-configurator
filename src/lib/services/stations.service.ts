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
        label_y: -30,
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

      return {
        station: newStation,
        visualId,
      }
    } catch (error) {
      return this.handleError(error, 'StationsService.create')
    }
  }

  async delete(stationId: string): Promise<void> {
    try {
      const station = await stationsRepo.getById(stationId)

      if (!station) {
        throw new Error(`Station ${stationId} not found`)
      }

      const [links, segments, line] = await Promise.all([
        visualStationLinksRepo.getByStationId(stationId),
        segmentsRepo.getByStationId(stationId),
        linesRepo.getById(station.line_id),
      ])

      const visualIds = [...new Set(links.map((link) => link.visual_id))]

      const visualLinks = await Promise.all(
        visualIds.map(async (visualId) => ({
          visualId,
          links: await visualStationLinksRepo.getByVisualId(visualId),
        }))
      )

      const visualIdsToDelete = visualLinks
        .filter(({ links: linksForVisual }) =>
          linksForVisual.every((link) => link.station_id === stationId)
        )
        .map(({ visualId }) => visualId)

      await Promise.all([
        ...segments.map((segment) => segmentsRepo.delete(segment.id)),
        ...links.map((link) => visualStationLinksRepo.delete(link.id)),
        ...visualIdsToDelete.map((visualId) => visualsRepo.delete(visualId)),
      ])

      if (line) {
        await linesRepo.update(station.line_id, {
          logicalStationIds: (line.logicalStationIds ?? []).filter((id) => id !== stationId),
          visualStationIds: (line.visualStationIds ?? []).filter(
            (id) => !visualIdsToDelete.includes(id)
          ),
        })
      }

      await stationsRepo.delete(stationId)
    } catch (error) {
      return this.handleError(error, 'StationsService.delete')
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
