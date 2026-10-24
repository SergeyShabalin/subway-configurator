import {
  linesRepo,
  segmentsRepo,
  stationsRepo,
  visualsRepo,
  visualStationLinksRepo,
  visualTransfersRepo,
} from '@/src/lib/indexeddb/repositories'
import type { Line, Segment, Station, VisualStationLink } from '@/types/metro'
import { BaseService } from './base.service'

const DEFAULT_LABEL_OFFSET = { x: 0, y: -30 }

interface CreateStationInput {
  name: string
  lineId: string
  x: number
  y: number
  transferToVisualId?: string
  timeMinutes: number
}

interface CreateStationResult {
  station: Station
  visualId: string
  segment?: Segment
}

export class StationsService extends BaseService {
  private async run<T>(context: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      return this.handleError(error, context)
    }
  }

  async getAll(): Promise<Array<Station>> {
    return this.run('StationsService.getAll', () => stationsRepo.getAll())
  }

  async createWithSegment(data: {
    name: string
    lineId: string
    x: number
    y: number
    timeMinutes: number
  }): Promise<{ station: Station; visualId: string; segment?: Segment }> {
    return this.run('StationsService.createWithSegment', () =>
      this.createInternal({
        name: data.name,
        lineId: data.lineId,
        x: data.x,
        y: data.y,
        timeMinutes: data.timeMinutes,
      })
    )
  }

  async create(data: CreateStationInput): Promise<{ station: Station; visualId: string }> {
    return this.run('StationsService.create', async () => {
      const { station, visualId } = await this.createInternal(data)
      return { station, visualId }
    })
  }

  async updateName(stationId: string, name: string): Promise<void> {
    return this.run('StationsService.updateName', async () => {
      const station = await stationsRepo.getById(stationId)

      if (!station) {
        throw new Error(`Station ${stationId} not found`)
      }
      const { stationIds } = await this.collectNode(stationId)
      const idsToRename = new Set<string>([stationId, ...stationIds])

      await Promise.all([...idsToRename].map((id) => stationsRepo.update(id, { name })))
    })
  }

  async delete(stationId: string): Promise<void> {
    return this.run('StationsService.delete', async () => {
      const station = await stationsRepo.getById(stationId)

      if (!station) {
        throw new Error(`Station ${stationId} not found`)
      }

      const { visualIds, stationIds } = await this.collectNode(stationId)

      const stationIdsToDelete = new Set<string>([stationId, ...stationIds])
      const idsArray = [...stationIdsToDelete]

      const [stationsToDelete, linksArrays, segmentsArrays, transfersArrays] = await Promise.all([
        Promise.all(idsArray.map((id) => stationsRepo.getById(id))),
        Promise.all(idsArray.map((id) => visualStationLinksRepo.getByStationId(id))),
        Promise.all(idsArray.map((id) => segmentsRepo.getByStationId(id))),
        Promise.all(visualIds.map((id) => visualTransfersRepo.getByVisualId(id))),
      ])

      const linksToDelete = ([] as Array<VisualStationLink>).concat(...linksArrays)

      const uniqueSegments = new Map<string, Segment>()
      for (const segments of segmentsArrays) {
        for (const segment of segments) {
          uniqueSegments.set(segment.id, segment)
        }
      }

      const transfersToDelete = new Map<string, { id: string }>()
      for (const list of transfersArrays) {
        for (const tr of list) {
          transfersToDelete.set(tr.id, tr)
        }
      }

      const lineIds = [
        ...new Set(
          stationsToDelete.filter((s): s is Station => s !== undefined).map((s) => s.line_id)
        ),
      ]

      const lines = await Promise.all(lineIds.map((id) => linesRepo.getById(id)))
      const linesToUpdate = lines.filter((line): line is Line => line !== undefined)

      await Promise.all([
        ...[...uniqueSegments.values()].map((segment) => segmentsRepo.delete(segment.id)),
        ...linksToDelete.map((link) => visualStationLinksRepo.delete(link.id)),
        ...visualIds.map((visualId) => visualsRepo.delete(visualId)),
        ...idsArray.map((id) => stationsRepo.delete(id)),
        ...[...transfersToDelete.values()].map((tr) => visualTransfersRepo.delete(tr.id)),
      ])

      const visualIdSet = new Set(visualIds)

      await Promise.all(
        linesToUpdate.map((line) =>
          linesRepo.update(line.id, {
            logicalStationIds: (line.logicalStationIds ?? []).filter(
              (id) => !stationIdsToDelete.has(id)
            ),
            visualStationIds: (line.visualStationIds ?? []).filter((id) => !visualIdSet.has(id)),
          })
        )
      )
    })
  }

  async countTransferStations(stationId: string): Promise<number> {
    return this.run('StationsService.countTransferStations', async () => {
      const { stationIds } = await this.collectNode(stationId)
      return stationIds.size
    })
  }

  // --- Методы ниже не про станции, но вызываются снаружи через stationsService,
  // --- поэтому оставлены здесь. Позже их стоит перенести в VisualsService / SegmentsService.

  async updateVisualPosition(visualId: string, x: number, y: number): Promise<void> {
    return this.run('StationsService.updateVisualPosition', () =>
      visualsRepo.updatePosition(visualId, x, y)
    )
  }

  async updateSegmentTime(segmentId: string, timeMinutes: number): Promise<void> {
    return this.run('StationsService.updateSegmentTime', () =>
      segmentsRepo.update(segmentId, { time_minutes: timeMinutes })
    )
  }

  // --- Приватные хелперы ---

  /**
   * Узел = все визуалы станции и все станции, привязанные к этим визуалам.
   * Раньше эта логика была скопирована в delete и countTransferStations.
   */
  private async collectNode(
    stationId: string
  ): Promise<{ visualIds: Array<string>; stationIds: Set<string> }> {
    const links = await visualStationLinksRepo.getByStationId(stationId)
    const visualIds = [...new Set(links.map((link) => link.visual_id))]

    const linksPerVisual = await Promise.all(
      visualIds.map((visualId) => visualStationLinksRepo.getByVisualId(visualId))
    )

    const stationIds = new Set<string>()
    for (const linksForVisual of linksPerVisual) {
      for (const link of linksForVisual) {
        stationIds.add(link.station_id)
      }
    }

    return { visualIds, stationIds }
  }

  /**
   * Определяет визуал, к которому привязывается новая станция:
   * либо существующий узел (пересадка), либо новый визуал.
   * Все валидации выполняются до первой записи в БД.
   */
  private async resolveVisual(
    data: CreateStationInput,
    line: Line
  ): Promise<{ visualId: string; name: string; isNewVisual: boolean }> {
    if (!data.transferToVisualId) {
      return { visualId: this.generateId(), name: data.name, isNewVisual: true }
    }

    const existingLinks = await visualStationLinksRepo.getByVisualId(data.transferToVisualId)

    if (existingLinks.length === 0) {
      throw new Error('TRANSFER_VISUAL_HAS_NO_STATIONS')
    }

    const primaryStation = await stationsRepo.getById(existingLinks[0].station_id)
    if (!primaryStation) {
      throw new Error('TRANSFER_STATION_NOT_FOUND')
    }

    if (line.visualStationIds?.includes(data.transferToVisualId)) {
      throw new Error('ALREADY_ON_LINE')
    }

    return {
      visualId: data.transferToVisualId,
      name: primaryStation.name,
      isNewVisual: false,
    }
  }

  private async createInternal(data: CreateStationInput): Promise<CreateStationResult> {
    const line = await linesRepo.getById(data.lineId)
    if (!line) {
      throw new Error(`Line ${data.lineId} not found`)
    }

    const { visualId, name, isNewVisual } = await this.resolveVisual(data, line)
    const stationId = this.generateId()

    if (isNewVisual) {
      await visualsRepo.save({
        id: visualId,
        x: data.x,
        y: data.y,
        labelOffset: { ...DEFAULT_LABEL_OFFSET },
        is_transfer: 0,
      })
    }

    const newStation: Station = {
      id: stationId,
      name,
      line_id: data.lineId,
      createdAt: Date.now(),
    }

    await stationsRepo.save(newStation)

    await visualStationLinksRepo.save({
      id: `${visualId}:${stationId}`,
      visual_id: visualId,
      station_id: stationId,
    })

    const updatedLogicalIds = [...(line.logicalStationIds ?? []), stationId]
    const updatedVisualIds = line.visualStationIds?.includes(visualId)
      ? line.visualStationIds
      : [...(line.visualStationIds ?? []), visualId]

    await linesRepo.update(data.lineId, {
      visualStationIds: updatedVisualIds,
      logicalStationIds: updatedLogicalIds,
    })

    if (!isNewVisual) {
      await visualsRepo.update(visualId, { is_transfer: 1 })
    }

    let segment: Segment | undefined

    if (updatedLogicalIds.length > 1) {
      const previousStationId = updatedLogicalIds[updatedLogicalIds.length - 2]

      if (previousStationId) {
        segment = {
          id: this.generateId(),
          from_station_id: previousStationId,
          to_station_id: stationId,
          line_id: data.lineId,
          time_minutes: data.timeMinutes,
        }

        await segmentsRepo.save(segment)
      }
    }

    return { station: newStation, visualId, segment }
  }
}

export const stationsService = new StationsService()
