import { linesRepo, segmentsRepo } from '@/src/lib/indexeddb/repositories'
import type { Line, Segment } from '@/types/metro'
import { BaseService } from './base.service'

export class LinesService extends BaseService {
  async getAll(): Promise<Array<Line>> {
    try {
      return await linesRepo.getAll()
    } catch (error) {
      return this.handleError(error, 'LinesService.getAll')
    }
  }

  async create(data: { name: string; color: string; isCircular?: boolean }): Promise<Line> {
    try {
      const newLine: Line = {
        id: this.generateId(),
        name: data.name,
        color: data.color,
        is_circular: data.isCircular ? 1 : 0,
        visualStationIds: [],
        logicalStationIds: [],
      }
      await linesRepo.save(newLine)
      return newLine
    } catch (error) {
      return this.handleError(error, 'LinesService.create')
    }
  }

  async update(
    lineId: string,
    data: { name?: string; color?: string; is_circular?: number }
  ): Promise<void> {
    try {
      const line = await linesRepo.getById(lineId)
      if (!line) {
        throw new Error(`Line ${lineId} not found`)
      }

      const wasCircular = line.is_circular === 1
      const willBeCircular = data.is_circular === 1

      await linesRepo.update(lineId, data)

      if (!wasCircular && willBeCircular) {
        await this.createCircularSegment(line)
      } else if (wasCircular && !willBeCircular) {
        await this.deleteCircularSegment(lineId)
      }
    } catch (error) {
      return this.handleError(error, 'LinesService.update')
    }
  }

  private async createCircularSegment(line: Line): Promise<void> {
    const stationIds = line.logicalStationIds ?? []
    if (stationIds.length < 2) return

    const firstStationId = stationIds[0]
    const lastStationId = stationIds[stationIds.length - 1]

    const lineSegments = await segmentsRepo.getByLineId(line.id)
    const alreadyExists = lineSegments.some(
      (s) =>
        (s.from_station_id === lastStationId && s.to_station_id === firstStationId) ||
        (s.from_station_id === firstStationId && s.to_station_id === lastStationId)
    )

    if (alreadyExists) return

    const segment: Segment = {
      id: this.generateId(),
      from_station_id: lastStationId,
      to_station_id: firstStationId,
      line_id: line.id,
      time_minutes: 2,
    }

    await segmentsRepo.save(segment)
  }

  private async deleteCircularSegment(lineId: string): Promise<void> {
    const line = await linesRepo.getById(lineId)
    if (!line) return

    const stationIds = line.logicalStationIds ?? []
    if (stationIds.length < 2) return

    const firstStationId = stationIds[0]
    const lastStationId = stationIds[stationIds.length - 1]

    const lineSegments = await segmentsRepo.getByLineId(lineId)
    const circularSegment = lineSegments.find(
      (s) =>
        (s.from_station_id === lastStationId && s.to_station_id === firstStationId) ||
        (s.from_station_id === firstStationId && s.to_station_id === lastStationId)
    )

    if (circularSegment) {
      await segmentsRepo.delete(circularSegment.id)
    }
  }
}

export const linesService = new LinesService()
