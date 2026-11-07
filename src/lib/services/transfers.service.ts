import { visualTransfersRepo } from '@/src/lib/indexeddb/repositories'
import type { VisualTransfer } from '@/types/metro'
import { BaseService } from './base.service'

const CONTEXT = {
  getAll: 'TransfersService.getAll',
  create: 'TransfersService.create',
  update: 'TransfersService.update',
  updateTime: 'TransfersService.updateTime',
  updateStyle: 'TransfersService.updateStyle',
  delete: 'TransfersService.delete',
} as const

export type TransferStyle = NonNullable<VisualTransfer['style']>

interface CreateTransferInput {
  fromVisualId: string
  toVisualId: string
  timeMinutes: number
  style?: TransferStyle
}

interface UpdateTransferInput {
  timeMinutes?: number
  style?: TransferStyle
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

  /**
   * Обновляет несколько полей пересадки одной записью.
   * Отдельные параллельные update (время и стиль) могут затереть друг друга:
   * обе операции читают старую запись, а побеждает последняя записанная.
   */
  async update(transferId: string, data: UpdateTransferInput): Promise<void> {
    return this.run(CONTEXT.update, () =>
      visualTransfersRepo.update(transferId, {
        ...(data.timeMinutes !== undefined && { time_minutes: data.timeMinutes }),
        ...(data.style !== undefined && { style: data.style }),
      })
    )
  }

  async updateTime(transferId: string, timeMinutes: number): Promise<void> {
    return this.run(CONTEXT.updateTime, () =>
      visualTransfersRepo.update(transferId, { time_minutes: timeMinutes })
    )
  }

  async updateStyle(transferId: string, style: TransferStyle): Promise<void> {
    return this.run(CONTEXT.updateStyle, () => visualTransfersRepo.update(transferId, { style }))
  }

  async delete(transferId: string): Promise<void> {
    return this.run(CONTEXT.delete, () => visualTransfersRepo.delete(transferId))
  }
}

export const transfersService = new TransfersService()
