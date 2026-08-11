import type { CreateLineData } from '@/lib/api'
import { BaseApiClient, EApiClientName } from '@/lib/api'

interface LineResponse {
  success: boolean
  lineId: string
  name: string
}

export class LinesClient extends BaseApiClient {
  constructor() {
    super(EApiClientName['station-constructor'], { platform: 'NODE' })
  }

  async create(data: CreateLineData): Promise<LineResponse> {
    try {
      return await this.post<LineResponse>('/lines', data)
    } catch (error) {
      console.error('[LinesClient] Failed to create line:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to create line')
    }
  }

  async getAll(): Promise<Array<{ id: string; name: string; color: string; isCircular: number }>> {
    try {
      return await this.get<Array<{ id: string; name: string; color: string; isCircular: number }>>(
        '/lines'
      )
    } catch (error) {
      console.error('[LinesClient] Failed to fetch lines:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch lines')
    }
  }
}
