import type { CreateLineData } from '@/lib/api'
import { linesClient } from '@/lib/api'

interface LineResponse {
  success: boolean
  lineId: string
  name: string
  color: string
}

interface Line {
  id: string
  name: string
  color: string
  isCircular: number
}

export const linesService = {
  async create(data: CreateLineData): Promise<LineResponse> {
    try {
      return await linesClient.create(data)
    } catch (error) {
      console.error('[linesService] Failed to create line:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to create line')
    }
  },

  async getAll(): Promise<Array<Line>> {
    try {
      return await linesClient.getAll()
    } catch (error) {
      console.error('[linesService] Failed to fetch lines:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch lines')
    }
  },
}
