import type { VisualTransfer } from '@/types/metro'
import { BaseRepository } from './base.repository'

export class VisualTransfersRepository extends BaseRepository<VisualTransfer> {
  protected storeName = 'visual_transfers'

  async getByVisualId(visualId: string): Promise<Array<VisualTransfer>> {
    const all = await this.getAll()
    return all.filter((t) => t.from_visual_id === visualId || t.to_visual_id === visualId)
  }
}

export const visualTransfersRepo = new VisualTransfersRepository()
