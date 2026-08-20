'use client'

import { linesRepo } from '@/src/lib/indexeddb/repositories/lines.repository'
import { segmentsRepo } from '@/src/lib/indexeddb/repositories/segments.repository'
import { stationsRepo } from '@/src/lib/indexeddb/repositories/stations.repository'
import { visualStationLinksRepo } from '@/src/lib/indexeddb/repositories/visual-station-links.repository'
import { useMetroStore } from '@/store'
import { useState } from 'react'

export const DownloadJson = () => {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>('')
  const { visuals } = useMetroStore()

  const handleDownload = async () => {
    setLoading(true)
    setStatus('⏳ Формирование данных...')

    try {
      // Загружаем все данные из IndexedDB
      const [lines, stations, visualStationLinks, segments] = await Promise.all([
        linesRepo.getAll(),
        stationsRepo.getAll(),
        visualStationLinksRepo.getAll(),
        segmentsRepo.getAll(),
      ])

      // Загружаем visuals из store (они уже с обновлёнными позициями)
      const visualsData = visuals

      // Преобразуем в формат как в metro.json
      const metroData = {
        lines: lines.reduce((acc: any, line: any) => {
          acc[line.id] = {
            id: Number(line.id),
            name: line.name,
            color: line.color,
            isCircular: Boolean(line.is_circular),
            visualStationIds: line.visualStationIds || [],
            logicalStationIds: line.logicalStationIds || [],
          }
          return acc
        }, {}),

        logic: {
          stations: stations.reduce((acc: any, station: any) => {
            // Находим visualId для станции
            const link = visualStationLinks.find((l: any) => l.station_id === station.id)
            acc[station.id] = {
              id: station.id,
              name: station.name,
              visualId: link?.visual_id || '',
            }
            return acc
          }, {}),

          segments: segments.reduce((acc: any, segment: any) => {
            acc[segment.id] = {
              id: segment.id,
              fromStationId: segment.from_station_id,
              toStationId: segment.to_station_id,
              timeMinutes: segment.time_minutes,
            }
            return acc
          }, {}),
        },

        visuals: {
          stations: visualsData.reduce((acc: any, visual: any) => {
            // Находим connections для visual
            const links = visualStationLinks.filter((l: any) => l.visual_id === visual.id)
            const connections = links.map((l: any) => l.station_id)

            // Определяем displayMode
            const displayMode = connections.length > 1 ? 'multiple' : 'single'

            acc[visual.id] = {
              id: visual.id,
              x: visual.x,
              y: visual.y,
              labelOffset: {
                x: visual.labelOffset?.x || 0,
                y: visual.labelOffset?.y || -60,
              },
              connections,
              displayMode,
            }
            return acc
          }, {}),
        },

        connections: {
          // Добавляем вспомогательные данные для совместимости
          visualToLogical: visualsData.reduce((acc: any, visual: any) => {
            const links = visualStationLinks.filter((l: any) => l.visual_id === visual.id)
            acc[visual.id] = links.map((l: any) => l.station_id)
            return acc
          }, {}),
        },
      }

      setStatus('📦 Создание файла...')

      // Создаём Blob и скачиваем
      const jsonString = JSON.stringify(metroData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `metro-data-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Освобождаем URL
      setTimeout(() => URL.revokeObjectURL(url), 100)

      setStatus(`✅ JSON скачан! (${(blob.size / 1024).toFixed(1)} KB)`)
    } catch (error) {
      console.error('❌ Download failed:', error)
      setStatus(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        marginTop: 8,
      }}
    >
      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px 16px',
          background: '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: loading ? 'wait' : 'pointer',
          fontSize: 14,
          fontWeight: 'bold',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? '⏳ Подготовка...' : '📥 Скачать JSON'}
      </button>
      {status && (
        <div
          style={{
            marginTop: 4,
            padding: '4px 8px',
            fontSize: 11,
            color: status.includes('✅') ? '#10b981' : '#ef4444',
            textAlign: 'center',
          }}
        >
          {status}
        </div>
      )}
    </div>
  )
}
