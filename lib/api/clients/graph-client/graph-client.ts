import type { GraphData } from '@/lib/api'
import { BaseApiClient, EApiClientName } from '@/lib/api'

export class GraphClient extends BaseApiClient {
  constructor() {
    super(EApiClientName['station-constructor'], { platform: 'NODE' })
  }

  async getGraph(): Promise<GraphData> {
    try {
      return await this.get<GraphData>('/graph')
    } catch (error) {
      console.error('[GraphClient] Failed to fetch graph data:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch graph data')
    }
  }
}
