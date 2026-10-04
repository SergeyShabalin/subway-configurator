import { visualsRepo } from '@/src/lib/indexeddb/repositories'
import type { Visual } from '@/types/metro'
import { BaseService } from './base.service'

export class VisualsService extends BaseService {
  async getAll(): Promise<Array<Visual>> {
    try {
      return await visualsRepo.getAll()
    } catch (error) {
      return this.handleError(error, 'VisualsService.getAll')
    }
  }
}

export const visualsService = new VisualsService()
