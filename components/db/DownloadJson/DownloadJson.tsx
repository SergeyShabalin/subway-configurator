'use client'

import { linesRepo } from '@/src/lib/indexeddb/repositories/lines.repository'
import { segmentsRepo } from '@/src/lib/indexeddb/repositories/segments.repository'
import { stationsRepo } from '@/src/lib/indexeddb/repositories/stations.repository'
import { visualStationLinksRepo } from '@/src/lib/indexeddb/repositories/visual-station-links.repository'
import { useMetroStore } from '@/store'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import styles from './DownloadJson.module.css'

type StatusType = 'success' | 'error'

interface Status {
  type: StatusType
  message: string
}

interface LineRecord {
  id: string
  name: string
  color: string
  is_circular: number
  visualStationIds: Array<string>
  logicalStationIds: Array<string>
}

interface StationRecord {
  id: string
  name: string
  line_id: string
}

interface LinkRecord {
  visual_id: string
  station_id: string
}

interface SegmentRecord {
  id: string
  from_station_id: string
  to_station_id: string
  time_minutes: number
}

interface VisualRecord {
  id: string
  x: number
  y: number
  labelOffset?: { x: number; y: number }
}

const buildLines = (lines: Array<LineRecord>) =>
  lines.reduce<Record<string, unknown>>((acc, line) => {
    acc[line.id] = {
      id: Number(line.id),
      name: line.name,
      color: line.color,
      isCircular: Boolean(line.is_circular),
      visualStationIds: line.visualStationIds,
      logicalStationIds: line.logicalStationIds,
    }
    return acc
  }, {})

const buildLogicStations = (stations: Array<StationRecord>, links: Array<LinkRecord>) =>
  stations.reduce<Record<string, unknown>>((acc, station) => {
    const link = links.find((l) => l.station_id === station.id)
    acc[station.id] = {
      id: station.id,
      name: station.name,
      visualId: link?.visual_id ?? '',
    }
    return acc
  }, {})

const buildLogicSegments = (segments: Array<SegmentRecord>) =>
  segments.reduce<Record<string, unknown>>((acc, segment) => {
    acc[segment.id] = {
      id: segment.id,
      fromStationId: segment.from_station_id,
      toStationId: segment.to_station_id,
      timeMinutes: segment.time_minutes,
    }
    return acc
  }, {})

const buildVisualStations = (visuals: Array<VisualRecord>, links: Array<LinkRecord>) =>
  visuals.reduce<Record<string, unknown>>((acc, visual) => {
    const connections = links.filter((l) => l.visual_id === visual.id).map((l) => l.station_id)

    acc[visual.id] = {
      id: visual.id,
      x: visual.x,
      y: visual.y,
      labelOffset: {
        x: visual.labelOffset?.x ?? 0,
        y: visual.labelOffset?.y ?? -60,
      },
      connections,
      displayMode: connections.length > 1 ? 'multiple' : 'single',
    }
    return acc
  }, {})

const buildVisualToLogical = (visuals: Array<VisualRecord>, links: Array<LinkRecord>) =>
  visuals.reduce<Record<string, Array<string>>>((acc, visual) => {
    acc[visual.id] = links.filter((l) => l.visual_id === visual.id).map((l) => l.station_id)
    return acc
  }, {})

const buildMetroData = (
  lines: Array<LineRecord>,
  stations: Array<StationRecord>,
  links: Array<LinkRecord>,
  segments: Array<SegmentRecord>,
  visuals: Array<VisualRecord>
) => ({
  lines: buildLines(lines),
  logic: {
    stations: buildLogicStations(stations, links),
    segments: buildLogicSegments(segments),
  },
  visuals: {
    stations: buildVisualStations(visuals, links),
  },
  connections: {
    visualToLogical: buildVisualToLogical(visuals, links),
  },
})

const triggerDownload = (data: unknown) => {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `metro-data-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  setTimeout(() => URL.revokeObjectURL(url), 100)

  return blob.size
}

export const DownloadJson = () => {
  const t = useTranslations('DownloadJson')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<Status | null>(null)
  const { visuals } = useMetroStore()

  const handleDownload = async () => {
    setLoading(true)
    setStatus({ type: 'success', message: t('status.building') })

    try {
      const [lines, stations, links, segments] = await Promise.all([
        linesRepo.getAll(),
        stationsRepo.getAll(),
        visualStationLinksRepo.getAll(),
        segmentsRepo.getAll(),
      ])

      setStatus({ type: 'success', message: t('status.creatingFile') })

      const metroData = buildMetroData(
        lines as Array<LineRecord>,
        stations as Array<StationRecord>,
        links as Array<LinkRecord>,
        segments as Array<SegmentRecord>,
        visuals as Array<VisualRecord>
      )
      const size = triggerDownload(metroData)

      setStatus({
        type: 'success',
        message: t('status.success', { size: (size / 1024).toFixed(1) }),
      })
    } catch (error) {
      console.error('Download failed:', error)
      setStatus({
        type: 'error',
        message: t('status.error', {
          message: error instanceof Error ? error.message : t('errors.unknown'),
        }),
      })
    } finally {
      setLoading(false)
    }
  }

  const statusClass = status
    ? status.type === 'success'
      ? styles.statusSuccess
      : styles.statusError
    : ''

  return (
    <div className={styles.wrapper}>
      <button type="button" onClick={handleDownload} disabled={loading} className={styles.button}>
        {loading ? (
          <>
            <span className={styles.spinner} /> {t('button.loading')}
          </>
        ) : (
          <>{t('button.idle')}</>
        )}
      </button>

      {status && <div className={`${styles.status} ${statusClass}`}>{status.message}</div>}
    </div>
  )
}
