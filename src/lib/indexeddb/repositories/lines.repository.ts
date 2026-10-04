import type { Line } from '@/types/metro'
import { BaseRepository } from './base.repository'

export class LinesRepository extends BaseRepository<Line> {
  protected storeName = 'lines'

  async getByName(name: string): Promise<Line | undefined> {
    const all = await this.getAll()
    return all.find((line) => line.name === name)
  }

  async getByColor(color: string): Promise<Array<Line>> {
    const all = await this.getAll()
    return all.filter((line) => line.color === color)
  }

  async getCircular(): Promise<Array<Line>> {
    const all = await this.getAll()
    return all.filter((line) => line.is_circular === 1)
  }
}

export const linesRepo = new LinesRepository()
