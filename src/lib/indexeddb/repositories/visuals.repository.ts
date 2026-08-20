import type { Visual } from '@/types/metro'
import { BaseRepository } from './base.repository'

export class VisualsRepository extends BaseRepository<Visual> {
  protected storeName = 'visuals'

  async updatePosition(id: string, x: number, y: number): Promise<void> {
    return this.update(id, { x, y })
  }
}

export const visualsRepo = new VisualsRepository()
