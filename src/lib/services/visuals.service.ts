import { visualsRepo } from '@/src/lib/indexeddb/repositories'
import { BaseService } from './base.service'

const CONTEXT = {
  updatePosition: 'VisualsService.updatePosition',
  updatePositions: 'VisualsService.updatePositions',
  updateLabelPosition: 'VisualsService.updateLabelPosition',
} as const

interface VisualPosition {
  id: string
  x: number
  y: number
}

export class VisualsService extends BaseService {
  private async run<T>(context: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      return this.handleError(error, context)
    }
  }

  async updatePosition(visualId: string, x: number, y: number): Promise<void> {
    return this.run(CONTEXT.updatePosition, () => visualsRepo.updatePosition(visualId, x, y))
  }

  async updatePositions(items: ReadonlyArray<VisualPosition>): Promise<void> {
    return this.run(CONTEXT.updatePositions, async () => {
      await Promise.all(items.map(({ id, x, y }) => visualsRepo.updatePosition(id, x, y)))
    })
  }

  async updateLabelPosition(visualId: string, labelX: number, labelY: number): Promise<void> {
    return this.run(CONTEXT.updateLabelPosition, () =>
      visualsRepo.update(visualId, { labelOffset: { x: labelX, y: labelY } })
    )
  }
}

export const visualsService = new VisualsService()
