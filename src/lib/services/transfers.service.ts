import { visualTransfersRepo } from '@/src/lib/indexeddb/repositories'
import type { VisualTransfer } from '@/types/metro'
import { BaseService } from './base.service'

export class TransfersService extends BaseService {
  async getAll(): Promise<Array<VisualTransfer>> {
    try {
      return await visualTransfersRepo.getAll()
    } catch (error) {
      return this.handleError(error, 'TransfersService.getAll')
    }
  }

  async create(data: {
    fromVisualId: string
    toVisualId: string
    timeMinutes: number
    style?: 'dashed' | 'dotted' | 'solid'
  }): Promise<VisualTransfer> {
    try {
      if (data.fromVisualId === data.toVisualId) {
        throw new Error('SAME_VISUAL')
      }

      const id = `transfer-${data.fromVisualId}-${data.toVisualId}`

      const existing = await visualTransfersRepo.getById(id)

      if (existing) {
        throw new Error('ALREADY_EXISTS')
      }

      const transfer: VisualTransfer = {
        id,
        from_visual_id: data.fromVisualId,
        to_visual_id: data.toVisualId,
        time_minutes: data.timeMinutes,
        style: data.style ?? 'dashed',
      }

      await visualTransfersRepo.save(transfer)

      return transfer
    } catch (error) {
      return this.handleError(error, 'TransfersService.create')
    }
  }

  async delete(transferId: string): Promise<void> {
    try {
      await visualTransfersRepo.delete(transferId)
    } catch (error) {
      return this.handleError(error, 'TransfersService.delete')
    }
  }

  async deleteByVisualId(visualId: string): Promise<void> {
    try {
      const transfers = await visualTransfersRepo.getByVisualId(visualId)
      await Promise.all(transfers.map((t) => visualTransfersRepo.delete(t.id)))
    } catch (error) {
      return this.handleError(error, 'TransfersService.deleteByVisualId')
    }
  }
}

export const transfersService = new TransfersService()
