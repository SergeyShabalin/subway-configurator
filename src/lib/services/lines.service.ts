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
}

export const linesService = new LinesService()
