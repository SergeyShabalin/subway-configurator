import type { CreateStationData } from '@/lib/api'
import { stationsClient } from '@/lib/api'

interface StationResponse {
  success: boolean
  stationId: string
  visualId: string
}

export const stationsService = {
  async create(data: CreateStationData): Promise<StationResponse> {
    try {
      return await stationsClient.create(data)
    } catch (error) {
      console.error('[stationsService] Failed to create station:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to create station')
    }
  },

  async delete(id: string): Promise<{ success: boolean }> {
    try {
      return await stationsClient.delete(id)
    } catch (error) {
      console.error('[stationsService] Failed to delete station:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to delete station')
    }
  },

  async updateVisualPosition(
    visualId: string,
    x: number,
    y: number
  ): Promise<{ success: boolean }> {
    try {
      return await stationsClient.updateVisualPosition(visualId, x, y)
    } catch (error) {
      console.error('[stationsService] Failed to update visual position:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to update visual position')
    }
  },
}
