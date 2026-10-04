'use client'

import { linesRepo } from '@/src/lib/indexeddb/repositories/lines.repository'
import { segmentsRepo } from '@/src/lib/indexeddb/repositories/segments.repository'
import { stationsRepo } from '@/src/lib/indexeddb/repositories/stations.repository'
import { visualStationLinksRepo } from '@/src/lib/indexeddb/repositories/visual-station-links.repository'
import { visualsRepo } from '@/src/lib/indexeddb/repositories/visuals.repository'
import { useMetroStore } from '@/store'
import { useTranslations } from 'next-intl'
import { ChangeEvent, DragEvent, useRef, useState } from 'react'
import styles from './UploadJson.module.css'

interface UploadJsonProps {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

type StatusType = 'success' | 'error' | 'info'

interface Status {
  type: StatusType
  message: string
}

interface LineInput {
  id: string | number
  name: string
  color: string
  isCircular?: boolean
  visualStationIds?: Array<string>
  logicalStationIds?: Array<string>
}

interface LogicStationInput {
  id: string | number
  name: string
  visualId?: string
}

interface VisualStationInput {
  id: string | number
  x: number
  y: number
  labelOffset?: { x: number; y: number }
  connections: Array<string>
}

interface SegmentInput {
  id: string | number
  fromStationId: string
  toStationId: string
  timeMinutes: number
}

interface MetroDataInput {
  lines: Record<string, LineInput>
  logic: {
    stations: Record<string, LogicStationInput>
    segments: Record<string, SegmentInput>
  }
  visuals: {
    stations: Record<string, VisualStationInput>
  }
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

interface VisualRecord {
  id: string
  x: number
  y: number
  label_x: number
  label_y: number
  is_transfer: number
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

type TranslationParams = Record<string, string | number | Date>

type ErrorKey =
  | 'missingField'
  | 'linesNotObject'
  | 'logicStationsMissing'
  | 'logicSegmentsMissing'
  | 'visualsStationsMissing'
  | 'noLines'
  | 'lineInvalid'
  | 'notJson'
  | 'unknown'

class MetroDataError extends Error {
  constructor(
    public readonly key: ErrorKey,
    public readonly params?: TranslationParams
  ) {
    super(key)
    this.name = 'MetroDataError'
  }
}

interface ValidationRule {
  check: (data: Partial<MetroDataInput>) => boolean
  key: ErrorKey
  params?: (data: Partial<MetroDataInput>) => TranslationParams
}

const hasField = (data: Record<string, unknown>, field: string) =>
  data[field] !== undefined && data[field] !== null

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const validateLines = (data: Partial<MetroDataInput>): Array<{ id: string; field: string }> => {
  const problems: Array<{ id: string; field: string }> = []
  if (!isObject(data.lines)) return problems

  for (const [id, line] of Object.entries(data.lines)) {
    if (!line?.id) problems.push({ id, field: 'Id' })
    if (!line?.name) problems.push({ id, field: 'Name' })
    if (!line?.color) problems.push({ id, field: 'Color' })
    if (!Array.isArray(line?.visualStationIds)) {
      problems.push({ id, field: 'VisualStationIds' })
    }
    if (!Array.isArray(line?.logicalStationIds)) {
      problems.push({ id, field: 'LogicalStationIds' })
    }
  }

  return problems
}

const VALIDATION_RULES: Array<ValidationRule> = [
  {
    check: (d) => hasField(d as Record<string, unknown>, 'lines'),
    key: 'missingField',
    params: () => ({ field: 'lines' }),
  },
  {
    check: (d) => hasField(d as Record<string, unknown>, 'logic'),
    key: 'missingField',
    params: () => ({ field: 'logic' }),
  },
  {
    check: (d) => hasField(d as Record<string, unknown>, 'visuals'),
    key: 'missingField',
    params: () => ({ field: 'visuals' }),
  },
  {
    check: (d) => isObject(d.lines),
    key: 'linesNotObject',
  },
  {
    check: (d) => isObject(d?.logic?.stations),
    key: 'logicStationsMissing',
  },
  {
    check: (d) => isObject(d?.logic?.segments),
    key: 'logicSegmentsMissing',
  },
  {
    check: (d) => isObject(d?.visuals?.stations),
    key: 'visualsStationsMissing',
  },
  {
    check: (d) => Object.keys(d.lines ?? {}).length > 0,
    key: 'noLines',
  },
  {
    check: (d) => validateLines(d).length === 0,
    key: 'lineInvalid',
  },
]

const validateMetroData = (data: Partial<MetroDataInput>) => {
  for (const rule of VALIDATION_RULES) {
    if (!rule.check(data)) {
      throw new MetroDataError(rule.key, rule.params?.(data))
    }
  }
}

const buildLineRecords = (lines: Record<string, LineInput>): Array<LineRecord> =>
  Object.values(lines).map((line) => ({
    id: String(line.id),
    name: line.name,
    color: line.color,
    is_circular: line.isCircular ? 1 : 0,
    visualStationIds: line.visualStationIds ?? [],
    logicalStationIds: line.logicalStationIds ?? [],
  }))

const buildStationRecords = (
  stations: Record<string, LogicStationInput>,
  lines: Record<string, LineInput>
): Array<StationRecord> => {
  const records: Array<StationRecord> = []
  const linesArray = Object.values(lines)

  for (const station of Object.values(stations)) {
    const line = linesArray.find((l) => l.logicalStationIds?.includes(String(station.id)))
    if (!line) {
      console.warn(`Station ${station.id} (${station.name}) skipped — no line found`)
      continue
    }
    records.push({
      id: String(station.id),
      name: station.name,
      line_id: String(line.id),
    })
  }

  return records
}

const buildVisualRecords = (visuals: Record<string, VisualStationInput>): Array<VisualRecord> =>
  Object.values(visuals).map((v) => ({
    id: String(v.id),
    x: v.x,
    y: v.y,
    label_x: v.labelOffset?.x ?? 0,
    label_y: v.labelOffset?.y ?? -60,
    is_transfer: v.connections.length > 1 ? 1 : 0,
  }))

const buildLinkRecords = (visuals: Record<string, VisualStationInput>): Array<LinkRecord> => {
  const links: Array<LinkRecord> = []

  for (const [visualId, visual] of Object.entries(visuals)) {
    for (const stationId of visual.connections) {
      links.push({
        visual_id: String(visualId),
        station_id: String(stationId),
      })
    }
  }

  return links
}

const buildSegmentRecords = (segments: Record<string, SegmentInput>): Array<SegmentRecord> =>
  Object.values(segments).map((s) => ({
    id: String(s.id),
    from_station_id: String(s.fromStationId),
    to_station_id: String(s.toStationId),
    time_minutes: s.timeMinutes,
  }))

export const UploadJson = ({ onSuccess, onError }: UploadJsonProps) => {
  const t = useTranslations('UploadJson')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<Status | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { loadData } = useMetroStore()

  const translateError = (error: unknown): string => {
    if (error instanceof MetroDataError) {
      return t(`errors.${error.key}`, error.params)
    }
    if (error instanceof Error) {
      return error.message
    }
    return t('errors.unknown')
  }

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      throw new MetroDataError('notJson')
    }

    setStatus({ type: 'info', message: t('status.reading') })

    const text = await file.text()
    const metroData = JSON.parse(text) as MetroDataInput

    validateMetroData(metroData)

    setStatus({ type: 'info', message: t('status.importing') })

    const lines = buildLineRecords(metroData.lines)
    await linesRepo.clear()
    await linesRepo.saveMany(lines)

    const stations = buildStationRecords(metroData.logic.stations, metroData.lines)
    await stationsRepo.clear()
    await stationsRepo.saveMany(stations)

    const visuals = buildVisualRecords(metroData.visuals.stations)
    await visualsRepo.clear()
    await visualsRepo.saveMany(visuals)

    const links = buildLinkRecords(metroData.visuals.stations)
    await visualStationLinksRepo.clear()
    await visualStationLinksRepo.saveMany(links)

    const segments = buildSegmentRecords(metroData.logic.segments)
    await segmentsRepo.clear()
    await segmentsRepo.saveMany(segments)

    await loadData()

    setStatus({
      type: 'success',
      message: t('status.success', {
        lines: lines.length,
        stations: stations.length,
        visuals: visuals.length,
      }),
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    onSuccess?.()

    setTimeout(() => {
      window.location.reload()
    }, 800)
  }

  const handleFile = async (file: File) => {
    setLoading(true)
    setStatus(null)

    try {
      await processFile(file)
    } catch (error) {
      console.error('Upload failed:', error)
      const message = translateError(error)

      setStatus({
        type: 'error',
        message: t('status.error', { message }),
      })

      onError?.(error instanceof Error ? error : new Error(message))
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await handleFile(file)
  }

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (!file) return
    await handleFile(file)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const statusClass = status
    ? status.type === 'success'
      ? styles.statusSuccess
      : status.type === 'error'
        ? styles.statusError
        : styles.statusInfo
    : ''

  return (
    <div
      className={styles.wrapper}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label
        htmlFor="upload-json"
        className={`${styles.dropzone} ${
          isDragging ? styles.dropzoneDragging : ''
        } ${loading ? styles.dropzoneLoading : ''}`}
      >
        {loading ? (
          <>
            <span className={styles.spinner} />
            {t('button.loading')}
          </>
        ) : isDragging ? (
          t('button.dragging')
        ) : (
          <>{t('button.idle')}</>
        )}
        <input
          ref={fileInputRef}
          id="upload-json"
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          disabled={loading}
          className={styles.fileInput}
        />
      </label>

      {status && <div className={`${styles.status} ${statusClass}`}>{status.message}</div>}

      {isDragging && <div className={styles.dragOverlay}>{t('dragOverlay')}</div>}
    </div>
  )
}
