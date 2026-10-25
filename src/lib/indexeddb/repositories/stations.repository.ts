import type { Station } from '@/types/metro'
import { BaseRepository } from './base.repository'

export class StationsRepository extends BaseRepository<Station> {
  protected storeName = 'stations'
}

export const stationsRepo = new StationsRepository()
