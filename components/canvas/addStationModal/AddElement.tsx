'use client'

import { Modal } from '@/components/ui/Modal/Modal'
import { linesService, stationsService } from '@/src/lib/services'
import { useMetroStore } from '@/store'
import { useEffect, useRef, useState } from 'react'
import styles from './AddElement.module.css'

interface AddElementProps {
  isOpen: boolean
  onClose: () => void
  position: { x: number; y: number }
  onStationAdded?: () => void
  onLineAdded?: () => void
}

type TabType = 'station' | 'line'

export const AddElement = ({
  isOpen,
  onClose,
  position,
  onStationAdded,
  onLineAdded,
}: AddElementProps) => {
  const { lines, loadData } = useMetroStore()
  const [activeTab, setActiveTab] = useState<TabType>('station')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const modalContentRef = useRef<HTMLDivElement>(null)

  const [stationName, setStationName] = useState('')
  const [selectedLineId, setSelectedLineId] = useState<string>('')
  const [timeMinutes, setTimeMinutes] = useState<number>(5)
  const [isStationLoading, setIsStationLoading] = useState(false)

  const [lineName, setLineName] = useState('')
  const [lineColor, setLineColor] = useState('#3b82f6')
  const [isLineLoading, setIsLineLoading] = useState(false)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const modalContent = modalContentRef.current

    if (isDropdownOpen && modalContent) {
      modalContent.style.overflow = 'hidden'
    } else if (modalContent) {
      modalContent.style.overflow = 'auto'
    }

    return () => {
      if (modalContent) {
        modalContent.style.overflow = 'auto'
      }
    }
  }, [isDropdownOpen])

  useEffect(() => {
    if (!isOpen) {
      const timeoutId = setTimeout(() => {
        setIsDropdownOpen(false)
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [isOpen])

  // AddElement.tsx
  const handleAddStation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stationName.trim() || !selectedLineId) return

    setIsStationLoading(true)
    try {
      await stationsService.createWithSegment({
        name: stationName,
        lineId: selectedLineId,
        x: position.x,
        y: position.y,
        timeMinutes: timeMinutes,
      })

      await loadData()
      onStationAdded?.()
      onClose()
      setStationName('')
      setSelectedLineId('')
      setTimeMinutes(5)
    } catch (error) {
      console.error('Error creating station:', error)
      alert('Ошибка при создании станции')
    } finally {
      setIsStationLoading(false)
    }
  }

  const handleAddLine = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lineName.trim()) return

    setIsLineLoading(true)
    try {
      await linesService.create({
        name: lineName,
        color: lineColor,
      })

      await loadData()
      onLineAdded?.()
      onClose()
      setLineName('')
      setLineColor('#3b82f6')
    } catch (error) {
      console.error('Error creating line:', error)
      alert('Ошибка при создании ветки')
    } finally {
      setIsLineLoading(false)
    }
  }

  const handleClose = () => {
    setStationName('')
    setSelectedLineId('')
    setLineName('')
    setLineColor('#3b82f6')
    setTimeMinutes(5)
    setIsDropdownOpen(false)
    onClose()
  }

  const selectedLine = lines.find((l) => l.id === selectedLineId)

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Добавить элемент" size="medium">
      <div ref={modalContentRef} className={styles.modalContent}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'station' ? styles.active : ''}`}
            onClick={() => {
              setActiveTab('station')
              setIsDropdownOpen(false)
            }}
          >
            Станция
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'line' ? styles.active : ''}`}
            onClick={() => {
              setActiveTab('line')
              setIsDropdownOpen(false)
            }}
          >
            Ветка
          </button>
        </div>

        {activeTab === 'station' && (
          <form onSubmit={handleAddStation} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Название станции</label>
              <input
                type="text"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                placeholder="Введите название..."
                className={styles.input}
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Ветка</label>
              <div className={styles.dropdownWrapper} ref={dropdownRef}>
                <div
                  className={`${styles.dropdownTrigger} ${isDropdownOpen ? styles.open : ''}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {selectedLineId && selectedLine ? (
                    <span className={styles.optionLine}>
                      <span
                        className={styles.colorDot}
                        style={{ backgroundColor: selectedLine.color }}
                      />
                      {selectedLine.name}
                    </span>
                  ) : (
                    <span className={styles.placeholder}>Выберите ветку</span>
                  )}
                  <span className={styles.arrow}>▼</span>
                </div>

                {isDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    {lines.length === 0 ? (
                      <div className={styles.dropdownEmpty}>
                        Нет веток. Создайте ветку в соседней вкладке.
                      </div>
                    ) : (
                      lines.map((line) => (
                        <div
                          key={line.id}
                          className={`${styles.dropdownItem} ${
                            line.id === selectedLineId ? styles.dropdownItemActive : ''
                          }`}
                          onClick={() => {
                            setSelectedLineId(line.id)
                            setIsDropdownOpen(false)
                          }}
                        >
                          <span className={styles.optionLine}>
                            <span
                              className={styles.colorDot}
                              style={{ backgroundColor: line.color }}
                            />
                            {line.name}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Время до предыдущей станции (мин)
                <span className={styles.hint}>Для первой станции на линии оставьте 0</span>
              </label>
              <input
                type="number"
                value={timeMinutes}
                onChange={(e) => setTimeMinutes(Number(e.target.value))}
                min={0}
                max={60}
                className={styles.input}
              />
            </div>

            <div className={styles.coordinates}>
              <span>
                Координаты: X={Math.round(position.x)}, Y={Math.round(position.y)}
              </span>
            </div>

            <button
              type="submit"
              disabled={!stationName.trim() || !selectedLineId || isStationLoading}
              className={styles.submitButton}
            >
              {isStationLoading ? 'Добавление...' : 'Добавить станцию'}
            </button>
          </form>
        )}

        {activeTab === 'line' && (
          <form onSubmit={handleAddLine} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Название ветки</label>
              <input
                type="text"
                value={lineName}
                onChange={(e) => setLineName(e.target.value)}
                placeholder="Введите название ветки..."
                className={styles.input}
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Цвет ветки</label>
              <div className={styles.colorPicker}>
                <input
                  type="color"
                  value={lineColor}
                  onChange={(e) => setLineColor(e.target.value)}
                  className={styles.colorInput}
                />
                <span className={styles.colorValue}>{lineColor}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!lineName.trim() || isLineLoading}
              className={styles.submitButton}
            >
              {isLineLoading ? 'Добавление...' : 'Добавить ветку'}
            </button>
          </form>
        )}
      </div>
    </Modal>
  )
}
