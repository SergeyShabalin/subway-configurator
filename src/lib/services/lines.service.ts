import { linesRepo, visualStationLinksRepo } from '@/src/lib/indexeddb/repositories'
import type { Line } from '@/types/metro'
import { BaseService } from './base.service'
import { segmentsService } from './segments.service'

const CONTEXT = {
  getAll: 'LinesService.getAll',
  create: 'LinesService.create',
  update: 'LinesService.update',
  reorderStations: 'LinesService.reorderStations',
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

  async create(data: { name: string; color: string; isCircular?: boolean }): Promise<Line> {
    return this.run(CONTEXT.create, async () => {
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
    })
  }

  async update(
    lineId: string,
    data: { name?: string; color?: string; is_circular?: number }
  ): Promise<void> {
    return this.run(CONTEXT.update, async () => {
      const line = await linesRepo.getById(lineId)
      if (!line) {
        throw new Error(`Line ${lineId} not found`)
      }

      const wasCircular = line.is_circular === 1
      // Если поле не передано - закольцованность не меняется
      const willBeCircular = data.is_circular === undefined ? wasCircular : data.is_circular === 1

      await linesRepo.update(lineId, data)

      if (!wasCircular && willBeCircular) {
        await segmentsService.createClosing(line)
      } else if (wasCircular && !willBeCircular) {
        await segmentsService.deleteClosing(line)
      }
    })
  }

  /** Новый порядок станций на линии: сегменты, logicalStationIds и visualStationIds. */
  async reorderStations(lineId: string, orderedStationIds: Array<string>): Promise<void> {
    return this.run(CONTEXT.reorderStations, async () => {
      const line = await linesRepo.getById(lineId)
      if (!line) {
        throw new Error(`Line ${lineId} not found`)
      }

      // Проверка набора станций и пересборка сегментов идут по старому порядку линии
      await segmentsService.reorder(line, orderedStationIds)

      // Карта рисует линию по visualStationIds, поэтому порядок визуалов пересчитываем тоже
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
}

export const linesService = new LinesService()
