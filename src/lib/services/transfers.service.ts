import { visualTransfersRepo } from '@/src/lib/indexeddb/repositories'
import type { VisualTransfer } from '@/types/metro'
import { BaseService } from './base.service'

const CONTEXT = {
  getAll: 'TransfersService.getAll',
  create: 'TransfersService.create',
  updateTime: 'TransfersService.updateTime',
  delete: 'TransfersService.delete',
} as const

interface CreateTransferInput {
  fromVisualId: string
  toVisualId: string
  timeMinutes: number
  style?: 'dashed' | 'dotted' | 'solid'
}

export class TransfersService extends BaseService {
  private async run<T>(context: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      return this.handleError(error, context)
    }
  }

  async getAll(): Promise<Array<VisualTransfer>> {
    return this.run(CONTEXT.getAll, () => visualTransfersRepo.getAll())
  }

  async create(data: CreateTransferInput): Promise<VisualTransfer> {
    return this.run(CONTEXT.create, async () => {
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
    })
  }

  async updateTime(transferId: string, timeMinutes: number): Promise<void> {
    return this.run(CONTEXT.updateTime, () =>
      visualTransfersRepo.update(transferId, { time_minutes: timeMinutes })
    )
  }

  async delete(transferId: string): Promise<void> {
    return this.run(CONTEXT.delete, () => visualTransfersRepo.delete(transferId))
  }
}

export const transfersService = new TransfersService()
