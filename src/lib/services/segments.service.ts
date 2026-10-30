import { segmentsRepo } from '@/src/lib/indexeddb/repositories'
import type { Segment } from '@/types/metro'
import { BaseService } from './base.service'

const CONTEXT = {
  create: 'SegmentsService.create',
  updateTime: 'SegmentsService.updateTime',
  createClosing: 'SegmentsService.createClosing',
  deleteClosing: 'SegmentsService.deleteClosing',
  bridgeRemoved: 'SegmentsService.bridgeRemoved',
  reorder: 'SegmentsService.reorder',
} as const

const DEFAULT_CLOSING_SEGMENT_MINUTES = 2
const DEFAULT_NEW_SEGMENT_MINUTES = 2
const MIN_STATIONS_FOR_CLOSING = 3

interface LineStationsRef {
  id: string
  logicalStationIds?: Array<string>
}

interface LineWithCircularFlag extends LineStationsRef {
  is_circular?: number
}

interface CreateSegmentInput {
  fromStationId: string
  toStationId: string
  lineId: string
  timeMinutes: number
}

export class SegmentsService extends BaseService {
  private async run<T>(context: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      return this.handleError(error, context)
    }
  }

  async create(data: CreateSegmentInput): Promise<Segment> {
    return this.run(CONTEXT.create, () => this.save(data))
  }

  async updateTime(segmentId: string, timeMinutes: number): Promise<void> {
    return this.run(CONTEXT.updateTime, () =>
      segmentsRepo.update(segmentId, { time_minutes: timeMinutes })
    )
  }

  /** Замыкающий сегмент: последняя станция линии → первая. Для линии короче трёх станций его нет. */
  async createClosing(line: LineStationsRef): Promise<void> {
    return this.run(CONTEXT.createClosing, async () => {
      const { segment, firstStationId, lastStationId } = await this.findClosing(line)

      if (segment || !firstStationId || !lastStationId) return

      await this.save({
        fromStationId: lastStationId,
        toStationId: firstStationId,
        lineId: line.id,
        timeMinutes: DEFAULT_CLOSING_SEGMENT_MINUTES,
      })
    })
  }

  async deleteClosing(line: LineStationsRef): Promise<void> {
    return this.run(CONTEXT.deleteClosing, async () => {
      const { segment } = await this.findClosing(line)

      if (segment) {
        await segmentsRepo.delete(segment.id)
      }
    })
  }

  /**
   * Вызывается ДО удаления станций. Было a-b, b-c, удаляем b → остаётся a-c.
   * Время берётся у сегмента a-b. Для кольцевой линии соседи ищутся по кругу.
   */
  async bridgeRemoved(line: LineWithCircularFlag, removed: Set<string>): Promise<void> {
    return this.run(CONTEXT.bridgeRemoved, async () => {
      const order = line.logicalStationIds ?? []
      const count = order.length
      const isCircular = line.is_circular === 1
      const segments = await segmentsRepo.getByLineId(line.id)
      const bridges: Array<CreateSegmentInput> = []

      const findBetween = (a: string, b: string) =>
        segments.find(
          (s) =>
            (s.from_station_id === a && s.to_station_id === b) ||
            (s.from_station_id === b && s.to_station_id === a)
        )

      const hasPlannedBridge = (a: string, b: string) =>
        bridges.some(
          (br) =>
            (br.fromStationId === a && br.toStationId === b) ||
            (br.fromStationId === b && br.toStationId === a)
        )

      // Ближайшая оставшаяся станция от позиции from в направлении step (1 или -1)
      const findKept = (from: number, step: 1 | -1): string | undefined => {
        for (let k = 1; k < count; k++) {
          const j = from + step * k
          if (!isCircular && (j < 0 || j >= count)) return undefined

          const id = order[((j % count) + count) % count]
          if (!removed.has(id)) return id
        }
        return undefined
      }

      for (let i = 0; i < count; i++) {
        if (!removed.has(order[i])) continue

        const prev = findKept(i, -1)
        const next = findKept(i, 1)

        if (!prev || !next || prev === next) continue
        if (findBetween(prev, next) || hasPlannedBridge(prev, next)) continue

        bridges.push({
          fromStationId: prev,
          toStationId: next,
          lineId: line.id,
          timeMinutes: findBetween(prev, order[i])?.time_minutes ?? DEFAULT_CLOSING_SEGMENT_MINUTES,
        })
      }

      await Promise.all(bridges.map((bridge) => this.save(bridge)))
    })
  }

  /**
   * Пересобирает цепочку сегментов под новый порядок станций.
   * Пары соседей, которые уже были соединены, сохраняют id и время перегона (направление выравнивается).
   * Для новых пар время по умолчанию. Ненужные сегменты удаляются после записи новых.
   */
  async reorder(line: LineWithCircularFlag, orderedStationIds: Array<string>): Promise<void> {
    return this.run(CONTEXT.reorder, async () => {
      const ids = orderedStationIds
      const current = line.logicalStationIds ?? []

      const isSameSet =
        ids.length === current.length &&
        new Set(ids).size === ids.length &&
        ids.every((id) => current.includes(id))

      if (!isSameSet) {
        throw new Error(`Line ${line.id}: station set does not match the line`)
      }

      const isCircular = line.is_circular === 1 && ids.length >= MIN_STATIONS_FOR_CLOSING

      const pairs: Array<[string, string]> = []
      for (let i = 0; i < ids.length - 1; i++) pairs.push([ids[i], ids[i + 1]])
      if (isCircular) pairs.push([ids[ids.length - 1], ids[0]])

      const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)

      const oldSegments = await segmentsRepo.getByLineId(line.id)
      const oldByPair = new Map(
        oldSegments.map((s) => [pairKey(s.from_station_id, s.to_station_id), s])
      )

      const newSegments: Array<Segment> = pairs.map(([from, to]) => {
        const existing = oldByPair.get(pairKey(from, to))

        return {
          ...existing,
          id: existing?.id ?? this.generateId(),
          from_station_id: from,
          to_station_id: to,
          line_id: line.id,
          time_minutes: existing?.time_minutes ?? DEFAULT_NEW_SEGMENT_MINUTES,
        }
      })

      const newIds = new Set(newSegments.map((s) => s.id))

      await segmentsRepo.saveMany(newSegments)
      await Promise.all(
        oldSegments.filter((s) => !newIds.has(s.id)).map((s) => segmentsRepo.delete(s.id))
      )
    })
  }

  // Без run: публичные методы уже обёрнуты, поэтому ошибка не проходит handleError дважды
  private async save(data: CreateSegmentInput): Promise<Segment> {
    const segment: Segment = {
      id: this.generateId(),
      from_station_id: data.fromStationId,
      to_station_id: data.toStationId,
      line_id: data.lineId,
      time_minutes: data.timeMinutes,
    }

    await segmentsRepo.save(segment)
    return segment
  }

  private async findClosing(line: LineStationsRef): Promise<{
    segment?: Segment
    firstStationId?: string
    lastStationId?: string
  }> {
    const stationIds = line.logicalStationIds ?? []
    if (stationIds.length < MIN_STATIONS_FOR_CLOSING) return {}

    const firstStationId = stationIds[0]
    const lastStationId = stationIds[stationIds.length - 1]

    const lineSegments = await segmentsRepo.getByLineId(line.id)
    const segment = lineSegments.find(
      (s) =>
        (s.from_station_id === lastStationId && s.to_station_id === firstStationId) ||
        (s.from_station_id === firstStationId && s.to_station_id === lastStationId)
    )

    return { segment, firstStationId, lastStationId }
  }
}

export const segmentsService = new SegmentsService()
