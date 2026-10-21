import { linesRepo } from '@/src/lib/indexeddb/repositories'

import type { Line } from '@/types/metro'
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
  async update(lineId: string, data: { name?: string; color?: string }): Promise<void> {
    try {
      await linesRepo.update(lineId, data)
    } catch (error) {
      return this.handleError(error, 'LinesService.update')
    }
  }
}

export const linesService = new LinesService()
