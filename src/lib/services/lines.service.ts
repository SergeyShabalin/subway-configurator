import { linesRepo, visualStationLinksRepo } from '@/src/lib/indexeddb/repositories'
import { stationsService } from '@/src/lib/services/stations.service'
import type { BadgeEnd, Line, LineCircle, LineType, Point } from '@/types/metro'
import { BaseService } from './base.service'
import { segmentsService } from './segments.service'

const CONTEXT = {
  getAll: 'LinesService.getAll',
  create: 'LinesService.create',
  update: 'LinesService.update',
  updateBadgeOffset: 'LinesService.updateBadgeOffset',
  reorderStations: 'LinesService.reorderStations',
  setCircle: 'LinesService.setCircle',
  delete: 'LinesService.delete',
} as const

export class LinesService extends BaseService {
  private async run<T>(context: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      return this.handleError(error, context)
    }
  }

  async getAll(): Promise<Array<Line>> {
    return this.run(CONTEXT.getAll, () => linesRepo.getAll())
  }

  async create(data: {
    name: string
    color: string
    isCircular?: boolean
    type?: LineType
    lineBadge?: string
  }): Promise<Line> {
    return this.run(CONTEXT.create, async () => {
      const newLine: Line = {
        id: this.generateId(),
        name: data.name,
        color: data.color,
        is_circular: data.isCircular ? 1 : 0,
        type: data.type ?? 'subway',
        lineBadge: data.lineBadge,
        visualStationIds: [],
        logicalStationIds: [],
      }

      await linesRepo.save(newLine)
      return newLine
    })
  }

  async update(
    lineId: string,
    data: {
      name?: string
      color?: string
      is_circular?: number
      type?: LineType
      lineBadge?: string
    }
  ): Promise<void> {
    return this.run(CONTEXT.update, async () => {
      const line = await linesRepo.getById(lineId)
      if (!line) {
        throw new Error(`Line ${lineId} not found`)
      }

      const wasCircular = line.is_circular === 1
      const willBeCircular = data.is_circular === undefined ? wasCircular : data.is_circular === 1

      await linesRepo.update(lineId, data)

      if (!wasCircular && willBeCircular) {
        await segmentsService.createClosing(line)
      } else if (wasCircular && !willBeCircular) {
        await segmentsService.deleteClosing(line)
      }
    })
  }

  async delete(lineId: string): Promise<void> {
    return this.run(CONTEXT.delete, async () => {
      const line = await linesRepo.getById(lineId)
      if (!line) {
        throw new Error(`Line ${lineId} not found`)
      }
      await stationsService.deleteAllFromLine(line)
      await linesRepo.delete(lineId)
    })
  }

  async updateBadgeOffset(lineId: string, end: BadgeEnd, offset: Point): Promise<void> {
    return this.run(CONTEXT.updateBadgeOffset, async () => {
      const line = await linesRepo.getById(lineId)
      if (!line) {
        throw new Error(`Line ${lineId} not found`)
      }

      await linesRepo.update(lineId, {
        badgeOffsets: { ...line.badgeOffsets, [end]: offset },
      })
    })
  }

  async reorderStations(lineId: string, orderedStationIds: Array<string>): Promise<void> {
    return this.run(CONTEXT.reorderStations, async () => {
      const line = await linesRepo.getById(lineId)
      if (!line) {
        throw new Error(`Line ${lineId} not found`)
      }

      await segmentsService.reorder(line, orderedStationIds)

      const links = await visualStationLinksRepo.getAll()
      const visualByStation = new Map(links.map((l) => [l.station_id, l.visual_id]))

      const visualStationIds = orderedStationIds
        .map((id) => visualByStation.get(id))
        .filter((id): id is string => id !== undefined)

      await linesRepo.update(lineId, {
        logicalStationIds: orderedStationIds,
        visualStationIds,
      })
    })
  }

  async setCircle(lineId: string, circle: LineCircle | undefined): Promise<void> {
    return this.run(CONTEXT.setCircle, async () => {
      await linesRepo.update(lineId, { circle })
    })
  }
}

export const linesService = new LinesService()
