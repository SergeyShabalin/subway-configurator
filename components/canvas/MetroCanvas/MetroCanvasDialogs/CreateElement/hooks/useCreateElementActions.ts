import { linesService, stationsService } from '@/src/lib/services'
import type { CreateLinePayload, CreateStationPayload } from '../types'

export const useCreateElementActions = (reloadData: () => Promise<void>) => {
  const createStation = async (data: CreateStationPayload) => {
    await stationsService.create(data)
    await reloadData()
  }

  const createLine = async (data: CreateLinePayload) => {
    await linesService.create(data)
    await reloadData()
  }

  return { createStation, createLine }
}
