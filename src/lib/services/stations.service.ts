import {
  linesRepo,
  segmentsRepo,
  stationsRepo,
  visualsRepo,
  visualStationLinksRepo,
  visualTransfersRepo,
} from '@/src/lib/indexeddb/repositories'
import type { InsertPosition, Line, Segment, Station, VisualStationLink } from '@/types/metro'
import { BaseService } from './base.service'
import { segmentsService } from './segments.service'

const CONTEXT = {
  getAll: 'StationsService.getAll',
  create: 'StationsService.create',
  updateName: 'StationsService.updateName',
  delete: 'StationsService.delete',
  deleteFromLine: 'StationsService.deleteFromLine',
  deleteAllFromLine: 'StationsService.deleteAllFromLine',
  countTransferStations: 'StationsService.countTransferStations',
} as const

const DEFAULT_LABEL_OFFSET = { x: 0, y: -30 }
const DEFAULT_INSERT_POSITION: InsertPosition = 'end'

interface CreateStationInput {
  name: string
  lineId: string
  x: number
  y: number
  transferToVisualId?: string
  timeMinutes: number
  insertPosition?: InsertPosition
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
    return this.run(CONTEXT.getAll, () => stationsRepo.getAll())
  }

  async create(data: CreateStationInput): Promise<CreateStationResult> {
    return this.run(CONTEXT.create, async () => {
      const position = data.insertPosition ?? DEFAULT_INSERT_POSITION
      const isStart = position === 'start'

      const line = await linesRepo.getById(data.lineId)
      if (!line) {
        throw new Error(`Line ${data.lineId} not found`)
      }

      const { visualId, name, isNewVisual } = await this.resolveVisual(data, line)
      const stationId = this.generateId()

      const previousLogicalIds = line.logicalStationIds ?? []
      const neighborId = isStart
        ? previousLogicalIds[0]
        : previousLogicalIds[previousLogicalIds.length - 1]
      const isCircular = line.is_circular === 1

      if (isCircular) {
        await segmentsService.deleteClosing(line)
      }

      if (isNewVisual) {
        await visualsRepo.save({
          id: visualId,
          x: data.x,
          y: data.y,
          labelOffset: { ...DEFAULT_LABEL_OFFSET },
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

      const updatedLogicalIds = this.insertId(previousLogicalIds, stationId, position)
      const updatedVisualIds = line.visualStationIds?.includes(visualId)
        ? line.visualStationIds
        : this.insertId(line.visualStationIds ?? [], visualId, position)

      await linesRepo.update(data.lineId, {
        visualStationIds: updatedVisualIds,
        logicalStationIds: updatedLogicalIds,
      })

      const segment = neighborId
        ? await segmentsService.create({
            fromStationId: isStart ? stationId : neighborId,
            toStationId: isStart ? neighborId : stationId,
            lineId: data.lineId,
            timeMinutes: data.timeMinutes,
          })
        : undefined

      if (isCircular) {
        await segmentsService.createClosing({
          id: data.lineId,
          logicalStationIds: updatedLogicalIds,
        })
      }

      return { station: newStation, visualId, segment }
    })
  }

  async updateName(stationId: string, name: string): Promise<void> {
    return this.run(CONTEXT.updateName, async () => {
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
    return this.run(CONTEXT.delete, async () => {
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

      await Promise.all(
        linesToUpdate.map((line) => segmentsService.bridgeRemoved(line, stationIdsToDelete))
      )

      await Promise.all([
        ...[...uniqueSegments.values()].map((segment) => segmentsRepo.delete(segment.id)),
        ...linksToDelete.map((link) => visualStationLinksRepo.deleteLink(link)),
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

  /**
   * Удаляет одну логическую станцию с одной линии.
   *
   * Важно:
   * - удаляются только сегменты этой линии (не трогаем перегоны пересадочных линий);
   * - из visualStationIds линии убираются все визуалы, которые осиротели;
   * - визуалы/пересадки других линий не трогаются.
   */
  async deleteFromLine(stationId: string): Promise<void> {
    const station = await stationsRepo.getById(stationId)
    if (!station) {
      throw new Error(`Station ${stationId} not found`)
    }

    const [line, links, segments] = await Promise.all([
      linesRepo.getById(station.line_id),
      visualStationLinksRepo.getByStationId(stationId),
      segmentsRepo.getByStationId(stationId),
    ])

    const ownSegments = segments.filter((segment) => segment.line_id === station.line_id)
    const visualIds = [...new Set(links.map((link) => link.visual_id))]

    if (line) {
      await segmentsService.bridgeRemoved(line, new Set([stationId]))
    }

    const linksPerVisual = await Promise.all(
      visualIds.map((visualId) => visualStationLinksRepo.getByVisualId(visualId))
    )
    const orphanVisualIds = visualIds.filter((_, index) =>
      linksPerVisual[index].every((link) => link.station_id === stationId)
    )
    const orphanVisualSet = new Set(orphanVisualIds)

    const transfersArrays = await Promise.all(
      orphanVisualIds.map((visualId) => visualTransfersRepo.getByVisualId(visualId))
    )
    const transfersToDelete = new Map<string, { id: string }>()
    for (const list of transfersArrays) {
      for (const tr of list) transfersToDelete.set(tr.id, tr)
    }

    await Promise.all([
      ...ownSegments.map((segment) => segmentsRepo.delete(segment.id)),
      ...links.map((link) => visualStationLinksRepo.deleteLink(link)),
      stationsRepo.delete(stationId),
      ...orphanVisualIds.map((id) => visualsRepo.delete(id)),
      ...[...transfersToDelete.values()].map((tr) => visualTransfersRepo.delete(tr.id)),
    ])

    if (line) {
      await linesRepo.update(line.id, {
        logicalStationIds: (line.logicalStationIds ?? []).filter((id) => id !== stationId),
        visualStationIds: (line.visualStationIds ?? []).filter((id) => !orphanVisualSet.has(id)),
      })
    }
  }

  /**
   * Удаляет все логические станции линии одним проходом.
   * Используется при удалении линии — так нет гонки при обновлении visualStationIds
   * и не строятся промежуточные мосты.
   */
  async deleteAllFromLine(line: Line): Promise<void> {
    const stationIds = new Set(line.logicalStationIds ?? [])
    if (stationIds.size === 0) return

    const idsArray = [...stationIds]
    const [linksArrays, segmentsArrays] = await Promise.all([
      Promise.all(idsArray.map((id) => visualStationLinksRepo.getByStationId(id))),
      Promise.all(idsArray.map((id) => segmentsRepo.getByStationId(id))),
    ])

    const linksToDelete = ([] as Array<VisualStationLink>).concat(...linksArrays)
    const visualIds = [...new Set(linksToDelete.map((l) => l.visual_id))]

    const segmentsToDelete = new Map<string, Segment>()
    for (const segments of segmentsArrays) {
      for (const segment of segments) {
        if (segment.line_id === line.id) segmentsToDelete.set(segment.id, segment)
      }
    }

    const linksPerVisual = await Promise.all(
      visualIds.map((visualId) => visualStationLinksRepo.getByVisualId(visualId))
    )
    const orphanVisualIds = visualIds.filter((_, index) =>
      linksPerVisual[index].every((link) => stationIds.has(link.station_id))
    )
    const orphanVisualSet = new Set(orphanVisualIds)

    const transfersArrays = await Promise.all(
      orphanVisualIds.map((visualId) => visualTransfersRepo.getByVisualId(visualId))
    )
    const transfersToDelete = new Map<string, { id: string }>()
    for (const list of transfersArrays) {
      for (const tr of list) transfersToDelete.set(tr.id, tr)
    }

    await Promise.all([
      ...[...segmentsToDelete.values()].map((s) => segmentsRepo.delete(s.id)),
      ...linksToDelete.map((link) => visualStationLinksRepo.deleteLink(link)),
      ...idsArray.map((id) => stationsRepo.delete(id)),
      ...orphanVisualIds.map((id) => visualsRepo.delete(id)),
      ...[...transfersToDelete.values()].map((tr) => visualTransfersRepo.delete(tr.id)),
    ])

    const allLines = await linesRepo.getAll()
    const otherLines = allLines.filter((l) => l.id !== line.id)

    await Promise.all(
      otherLines.map((otherLine) => {
        const nextLogical = (otherLine.logicalStationIds ?? []).filter((id) => !stationIds.has(id))
        const nextVisual = (otherLine.visualStationIds ?? []).filter(
          (id) => !orphanVisualSet.has(id)
        )
        const logicalChanged = nextLogical.length !== (otherLine.logicalStationIds ?? []).length
        const visualChanged = nextVisual.length !== (otherLine.visualStationIds ?? []).length
        if (!logicalChanged && !visualChanged) return Promise.resolve()
        return linesRepo.update(otherLine.id, {
          logicalStationIds: nextLogical,
          visualStationIds: nextVisual,
        })
      })
    )
  }

  async countTransferStations(stationId: string): Promise<number> {
    return this.run(CONTEXT.countTransferStations, async () => {
      const { stationIds } = await this.collectNode(stationId)
      return stationIds.size
    })
  }

  private insertId(
    ids: ReadonlyArray<string>,
    id: string,
    position: InsertPosition
  ): Array<string> {
    return position === 'start' ? [id, ...ids] : [...ids, id]
  }

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
}

export const stationsService = new StationsService()
