'use client'

import { linesRepo } from '@/src/lib/indexeddb/repositories/lines.repository'
import { segmentsRepo } from '@/src/lib/indexeddb/repositories/segments.repository'
import { stationsRepo } from '@/src/lib/indexeddb/repositories/stations.repository'
import { visualStationLinksRepo } from '@/src/lib/indexeddb/repositories/visual-station-links.repository'
import { visualsRepo } from '@/src/lib/indexeddb/repositories/visuals.repository'
import { useMetroStore } from '@/store'
import { ChangeEvent, DragEvent, useRef, useState } from 'react'

interface UploadJsonProps {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export const UploadJson = ({ onSuccess, onError }: UploadJsonProps) => {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { loadData } = useMetroStore()

  // Валидация структуры JSON
  const validateMetroData = (data: any) => {
    const required = ['lines', 'logic', 'visuals']
    for (const key of required) {
      if (!data[key]) {
        throw new Error(`Отсутствует поле "${key}" в JSON`)
      }
    }

    if (typeof data.lines !== 'object') {
      throw new Error('Поле "lines" должно быть объектом')
    }

    if (!data.logic.stations || typeof data.logic.stations !== 'object') {
      throw new Error('Отсутствуют "logic.stations" или это не объект')
    }

    if (!data.logic.segments || typeof data.logic.segments !== 'object') {
      throw new Error('Отсутствуют "logic.segments" или это не объект')
    }

    if (!data.visuals.stations || typeof data.visuals.stations !== 'object') {
      throw new Error('Отсутствуют "visuals.stations" или это не объект')
    }

    // Проверяем, что есть хотя бы одна линия
    if (Object.keys(data.lines).length === 0) {
      throw new Error('В JSON нет ни одной линии')
    }

    // Проверяем, что у линий есть необходимые поля
    for (const [id, line] of Object.entries(data.lines) as [string, any][]) {
      if (!line.id) {
        throw new Error(`У линии "${id}" отсутствует поле "id"`)
      }
      if (!line.name) {
        throw new Error(`У линии "${id}" отсутствует поле "name"`)
      }
      if (!line.color) {
        throw new Error(`У линии "${id}" отсутствует поле "color"`)
      }
      if (!line.visualStationIds || !Array.isArray(line.visualStationIds)) {
        throw new Error(`У линии "${id}" отсутствует "visualStationIds" или это не массив`)
      }
      if (!line.logicalStationIds || !Array.isArray(line.logicalStationIds)) {
        throw new Error(`У линии "${id}" отсутствует "logicalStationIds" или это не массив`)
      }
    }

    return true
  }

  // Обработка файла
  const processFile = async (file: File) => {
    // Проверяем тип файла
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      throw new Error('Пожалуйста, выберите JSON файл')
    }

    setStatus({ type: 'info', message: '⏳ Чтение файла...' })

    const text = await file.text()
    const metroData = JSON.parse(text)

    // Валидация
    validateMetroData(metroData)

    setStatus({ type: 'info', message: '📦 Импорт данных...' })

    // 1. Импорт линий
    const lines = Object.values(metroData.lines).map((line: any) => ({
      id: String(line.id),
      name: line.name,
      color: line.color,
      is_circular: line.isCircular ? 1 : 0,
      visualStationIds: line.visualStationIds || [],
      logicalStationIds: line.logicalStationIds || [],
    }))

    await linesRepo.clear()
    await linesRepo.saveMany(lines)

    // 2. Импорт станций
    const logicStations = Object.values(metroData.logic.stations) as any[]
    const stations: any[] = []
    let skipped = 0

    for (const station of logicStations) {
      let lineId: string | null = null
      for (const line of Object.values(metroData.lines) as any[]) {
        if (line.logicalStationIds.includes(String(station.id))) {
          lineId = String(line.id)
          break
        }
      }

      if (lineId) {
        stations.push({
          id: String(station.id),
          name: station.name,
          line_id: lineId,
        })
      } else {
        skipped++
        console.warn(`⚠️ Station ${station.id} (${station.name}) skipped - no line found`)
      }
    }

    await stationsRepo.clear()
    await stationsRepo.saveMany(stations)

    // 3. Импорт визуальных элементов
    const visualsData = Object.values(metroData.visuals.stations) as any[]
    const visuals = visualsData.map((v) => ({
      id: String(v.id),
      x: v.x,
      y: v.y,
      label_x: v.labelOffset?.x || 0,
      label_y: v.labelOffset?.y || -60,
      is_transfer: v.connections.length > 1 ? 1 : 0,
    }))

    await visualsRepo.clear()
    await visualsRepo.saveMany(visuals)

    // 4. Импорт связей visual-station
    const links: any[] = []
    for (const [visualId, visual] of Object.entries(metroData.visuals.stations) as [
      string,
      any,
    ][]) {
      for (const stationId of visual.connections) {
        links.push({
          visual_id: String(visualId),
          station_id: String(stationId),
        })
      }
    }

    await visualStationLinksRepo.clear()
    await visualStationLinksRepo.saveMany(links)

    // 5. Импорт сегментов
    const segmentsData = Object.values(metroData.logic.segments) as any[]
    const segments = segmentsData.map((s) => ({
      id: String(s.id),
      from_station_id: String(s.fromStationId),
      to_station_id: String(s.toStationId),
      time_minutes: s.timeMinutes,
    }))

    await segmentsRepo.clear()
    await segmentsRepo.saveMany(segments)

    // Обновляем данные в приложении
    await loadData()

    setStatus({
      type: 'success',
      message: `✅ Загружено: ${lines.length} линий, ${stations.length} станций, ${visuals.length} визуалов`,
    })

    // Очищаем input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    onSuccess?.()

    // 👇 ПЕРЕЗАГРУЖАЕМ СТРАНИЦУ ДЛЯ ОБНОВЛЕНИЯ ВИЗУАЛОВ
    setTimeout(() => {
      window.location.reload()
    }, 800)
  }

  // Обработчик выбора файла
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setStatus(null)

    try {
      await processFile(file)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Неизвестная ошибка')
      console.error('❌ Upload failed:', err)
      setStatus({ type: 'error', message: `❌ Ошибка: ${err.message}` })
      onError?.(err)
    } finally {
      setLoading(false)
    }
  }

  // Обработчик Drag & Drop
  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (!file) return

    setLoading(true)
    setStatus(null)

    try {
      await processFile(file)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Неизвестная ошибка')
      console.error('❌ Upload failed:', err)
      setStatus({ type: 'error', message: `❌ Ошибка: ${err.message}` })
      onError?.(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  // Стили для статуса
  const getStatusColor = () => {
    if (!status) return 'transparent'
    switch (status.type) {
      case 'success':
        return '#10b981'
      case 'error':
        return '#ef4444'
      case 'info':
        return '#3b82f6'
      default:
        return '#6b7280'
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        position: 'relative',
      }}
    >
      {/* Кнопка загрузки */}
      <label
        htmlFor="upload-json"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '10px 16px',
          width: '100%',
          background: isDragging ? '#3b82f6' : loading ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: isDragging ? '2px dashed #fff' : '2px solid transparent',
          borderRadius: 6,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: 14,
          fontWeight: 'bold',
          opacity: loading ? 0.6 : 1,
          transition: 'all 0.2s',
        }}
      >
        {loading ? (
          <>
            <span className="animate-spin">⏳</span>
            Загрузка...
          </>
        ) : isDragging ? (
          '📂 Отпустите файл'
        ) : (
          <>📤 Загрузить JSON</>
        )}
        <input
          ref={fileInputRef}
          id="upload-json"
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          disabled={loading}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            opacity: 0,
            cursor: 'pointer',
          }}
        />
      </label>

      {/* Статус */}
      {status && (
        <div
          style={{
            marginTop: 8,
            padding: '8px 12px',
            background:
              status.type === 'error'
                ? '#fef2f2'
                : status.type === 'success'
                  ? '#f0fdf4'
                  : '#eff6ff',
            borderRadius: 4,
            fontSize: 12,
            color: getStatusColor(),
            border: `1px solid ${getStatusColor()}33`,
            wordBreak: 'break-word',
          }}
        >
          {status.message}
        </div>
      )}

      {/* Индикатор Drag & Drop */}
      {isDragging && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(59, 130, 246, 0.1)',
            border: '4px dashed #3b82f6',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 'bold',
            color: '#3b82f6',
            pointerEvents: 'none',
          }}
        >
          📂 Отпустите файл для загрузки
        </div>
      )}
    </div>
  )
}
