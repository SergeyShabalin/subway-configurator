import type { Line } from '@/types/metro'
import { BaseRepository } from './base.repository'

export class LinesRepository extends BaseRepository<Line> {
  protected storeName = 'lines'
}

export const linesRepo = new LinesRepository()
