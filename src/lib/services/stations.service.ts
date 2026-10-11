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

export class StationsService extends BaseService {
  async getAll(): Promise<Array<Station>> {
    try {
      return await stationsRepo.getAll()
    } catch (error) {
      return this.handleError(error, 'StationsService.getAll')
    }
  }

  async createWithSegment(data: {
    name: string
    lineId: string
    x: number
    y: number
    timeMinutes: number
  }): Promise<{ station: Station; visualId: string; segment?: Segment }> {
    try {
      const result = await this.create({
        name: data.name,
        lineId: data.lineId,
        x: data.x,
        y: data.y,
      })

      const allStations = await stationsRepo.getAll()

      const lineStations = allStations
        .filter((s) => s.line_id === data.lineId)
        .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0))

      let segment: Segment | undefined

      if (lineStations.length > 1 && data.timeMinutes > 0) {
        const previousStation = lineStations[lineStations.length - 2]

        if (previousStation) {
          segment = {
            id: this.generateId(),
            from_station_id: previousStation.id,
            to_station_id: result.station.id,
            line_id: data.lineId,
            time_minutes: data.timeMinutes,
          }

          await segmentsRepo.save(segment)
        }
      }

      return {
        station: result.station,
        visualId: result.visualId,
        segment,
      }
    } catch (error) {
      return this.handleError(error, 'StationsService.createWithSegment')
    }
  }

  async create(data: {
    name: string
    lineId: string
    x: number
    y: number
    transferToVisualId?: string
  }): Promise<{ station: Station; visualId: string }> {
    try {
      const stationId = this.generateId()

      let visualId: string
      let resolvedName = data.name

      if (data.transferToVisualId) {
        const existingVisual = await visualsRepo.getById(data.transferToVisualId)

        if (!existingVisual) {
          throw new Error(`Visual ${data.transferToVisualId} not found`)
        }

        const existingLinks = await visualStationLinksRepo.getByVisualId(data.transferToVisualId)

        if (existingLinks.length === 0) {
          throw new Error('TRANSFER_VISUAL_HAS_NO_STATIONS')
        }

        const primaryStation = await stationsRepo.getById(existingLinks[0].station_id)

        if (!primaryStation) {
          throw new Error('TRANSFER_STATION_NOT_FOUND')
        }

        resolvedName = primaryStation.name
        visualId = data.transferToVisualId

        const line = await linesRepo.getById(data.lineId)

        if (line?.visualStationIds?.includes(visualId)) {
          throw new Error('ALREADY_ON_LINE')
        }
      } else {
        visualId = this.generateId()

        await visualsRepo.save({
          id: visualId,
          x: data.x,
          y: data.y,
          label_x: 0,
          label_y: -30,
          is_transfer: 0,
        })
      }

      const newStation: Station = {
        id: stationId,
        name: resolvedName,
        line_id: data.lineId,
        createdAt: Date.now(),
      }

      await stationsRepo.save(newStation)

      await visualStationLinksRepo.save({
        id: `${visualId}:${stationId}`,
        visual_id: visualId,
        station_id: stationId,
      })

      const line = await linesRepo.getById(data.lineId)

      if (line) {
        const visualStationIds = line.visualStationIds ?? []
        const logicalStationIds = line.logicalStationIds ?? []

        await linesRepo.update(data.lineId, {
          visualStationIds: visualStationIds.includes(visualId)
            ? visualStationIds
            : [...visualStationIds, visualId],
          logicalStationIds: [...logicalStationIds, stationId],
        })
      }

      const allLinks = await visualStationLinksRepo.getByVisualId(visualId)

      if (allLinks.length > 1) {
        await visualsRepo.update(visualId, { is_transfer: 1 })
      }

      return {
        station: newStation,
        visualId,
      }
    } catch (error) {
      return this.handleError(error, 'StationsService.create')
    }
  }

  async updateName(stationId: string, name: string): Promise<void> {
    try {
      const station = await stationsRepo.getById(stationId)

      if (!station) {
        throw new Error(`Station ${stationId} not found`)
      }

      await stationsRepo.update(stationId, { name })
    } catch (error) {
      return this.handleError(error, 'StationsService.updateName')
    }
  }

  async delete(stationId: string): Promise<void> {
    try {
      const station = await stationsRepo.getById(stationId)

      if (!station) {
        throw new Error(`Station ${stationId} not found`)
      }

      const links = await visualStationLinksRepo.getByStationId(stationId)

      const visualIds = [...new Set(links.map((link) => link.visual_id))]

      const allVisualLinks = await Promise.all(
        visualIds.map(async (visualId) => ({
          visualId,
          links: await visualStationLinksRepo.getByVisualId(visualId),
        }))
      )

      const stationIdsToDelete = new Set<string>()
      stationIdsToDelete.add(stationId)

      for (const { links: linksForVisual } of allVisualLinks) {
        for (const link of linksForVisual) {
          stationIdsToDelete.add(link.station_id)
        }
      }

      const stationsToDelete = await Promise.all(
        [...stationIdsToDelete].map((id) => stationsRepo.getById(id))
      )

      const allLinksArrays = await Promise.all(
        [...stationIdsToDelete].map((id) => visualStationLinksRepo.getByStationId(id))
      )

      const allLinksToDelete = ([] as Array<VisualStationLink>).concat(...allLinksArrays)

      const allSegmentsArrays = await Promise.all(
        [...stationIdsToDelete].map((id) => segmentsRepo.getByStationId(id))
      )

      const uniqueSegments = new Map<string, Segment>()
      for (const segments of allSegmentsArrays) {
        for (const segment of segments) {
          uniqueSegments.set(segment.id, segment)
        }
      }

      const transfersArrays = await Promise.all(
        visualIds.map((visualId) => visualTransfersRepo.getByVisualId(visualId))
      )

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

      const linesToUpdate = new Map<string, Line>()

      for (const line of lines) {
        if (line) {
          linesToUpdate.set(line.id, line)
        }
      }

      await Promise.all([
        ...[...uniqueSegments.values()].map((segment) => segmentsRepo.delete(segment.id)),
        ...allLinksToDelete.map((link) => visualStationLinksRepo.delete(link.id)),
        ...visualIds.map((visualId) => visualsRepo.delete(visualId)),
        ...[...stationIdsToDelete].map((id) => stationsRepo.delete(id)),
        ...[...transfersToDelete.values()].map((tr) => visualTransfersRepo.delete(tr.id)),
      ])

      await Promise.all(
        [...linesToUpdate.entries()].map(([lineId, line]) => {
          const remainingLogical = (line.logicalStationIds ?? []).filter(
            (id) => !stationIdsToDelete.has(id)
          )

          const remainingVisual = (line.visualStationIds ?? []).filter(
            (id) => !visualIds.includes(id)
          )

          return linesRepo.update(lineId, {
            logicalStationIds: remainingLogical,
            visualStationIds: remainingVisual,
          })
        })
      )
    } catch (error) {
      return this.handleError(error, 'StationsService.delete')
    }
  }

  async countTransferStations(stationId: string): Promise<number> {
    try {
      const links = await visualStationLinksRepo.getByStationId(stationId)

      const visualIds = [...new Set(links.map((link) => link.visual_id))]

      const allLinks = await Promise.all(
        visualIds.map((visualId) => visualStationLinksRepo.getByVisualId(visualId))
      )

      const stationIds = new Set<string>()

      for (const linksForVisual of allLinks) {
        for (const link of linksForVisual) {
          stationIds.add(link.station_id)
        }
      }

      return stationIds.size
    } catch (error) {
      return this.handleError(error, 'StationsService.countTransferStations')
    }
  }

  async updateVisualPosition(visualId: string, x: number, y: number): Promise<void> {
    try {
      await visualsRepo.updatePosition(visualId, x, y)
    } catch (error) {
      return this.handleError(error, 'StationsService.updateVisualPosition')
    }
  }
}

export const stationsService = new StationsService()
