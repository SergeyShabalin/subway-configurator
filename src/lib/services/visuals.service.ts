import { visualsRepo } from '@/src/lib/indexeddb/repositories'
import type { Visual } from '@/types/metro'
import { BaseService } from './base.service'

export class VisualsService extends BaseService {
  private async run<T>(context: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      return this.handleError(error, context)
    }
  }

  async getAll(): Promise<Array<Visual>> {
    return this.run('VisualsService.getAll', () => visualsRepo.getAll())
  }

  async updatePosition(visualId: string, x: number, y: number): Promise<void> {
    return this.run('VisualsService.updatePosition', () =>
      visualsRepo.updatePosition(visualId, x, y)
    )
  }

  async updateLabelPosition(visualId: string, labelX: number, labelY: number): Promise<void> {
    return this.run('VisualsService.updateLabelPosition', () =>
      visualsRepo.update(visualId, { labelOffset: { x: labelX, y: labelY } })
    )
  }
}

export const visualsService = new VisualsService()
