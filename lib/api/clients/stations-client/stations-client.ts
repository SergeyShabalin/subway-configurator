import type { CreateStationData } from '@/lib/api'
import { BaseApiClient, EApiClientName } from '@/lib/api'

interface StationResponse {
  success: boolean
  stationId: string
  visualId: string
}

interface UpdatePositionResponse {
  success: boolean
}

export class StationsClient extends BaseApiClient {
  constructor() {
    super(EApiClientName['station-constructor'], { platform: 'NODE' })
  }

  async create(data: CreateStationData): Promise<StationResponse> {
    try {
      return await this.post<StationResponse>('/stations', data)
    } catch (error) {
      console.error('[StationsClient] Failed to create station:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to create station')
    }
  }

  async updateVisualPosition(
    visualId: string,
    x: number,
    y: number
  ): Promise<UpdatePositionResponse> {
    try {
      return await this.put<UpdatePositionResponse>(`/visuals/${visualId}`, { x, y })
    } catch (error) {
      console.error('[StationsClient] Failed to update visual position:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to update visual position')
    }
  }
}
