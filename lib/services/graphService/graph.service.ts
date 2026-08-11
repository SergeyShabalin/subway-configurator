import type { GraphData } from '@/lib/api'
import { graphClient } from '@/lib/api'

export const graphService = {
  async getGraph(): Promise<GraphData> {
    try {
      return await graphClient.getGraph()
    } catch (error) {
      console.error('[graphService] Failed to fetch graph:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch graph data')
    }
  },
}
