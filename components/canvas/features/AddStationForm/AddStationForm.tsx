'use client'

import { stationsService } from '@/src/lib/services'
import { useMetroStore } from '@/store'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './AddStationForm.module.css'

interface AddStationFormProps {
  position: { x: number; y: number }
  onSuccess?: () => void
  onCancel?: () => void
}

export const AddStationForm = ({ position, onSuccess, onCancel }: AddStationFormProps) => {
  const t = useTranslations('AddStationForm')
  const { lines, loadData } = useMetroStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

  const [stationName, setStationName] = useState('')
  const [selectedLineId, setSelectedLineId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDropdown = () => {
    if (!isDropdownOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stationName.trim() || !selectedLineId) return

    setIsLoading(true)
    try {
      await stationsService.create({
        name: stationName,
        lineId: selectedLineId,
        x: position.x,
        y: position.y,
      })

      await loadData()
      onSuccess?.()
      setStationName('')
      setSelectedLineId('')
    } catch (error) {
      console.error('Error creating station:', error)
      alert(t('errorCreate'))
    } finally {
      setIsLoading(false)
    }
  }

  const selectedLine = lines.find((l) => l.id === selectedLineId)

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>{t('nameLabel')}</label>
        <input
          type="text"
          value={stationName}
          onChange={(e) => setStationName(e.target.value)}
          placeholder={t('namePlaceholder')}
          className={styles.input}
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t('lineLabel')}</label>
        <div className={styles.dropdownWrapper}>
          <div
            ref={triggerRef}
            className={`${styles.dropdownTrigger} ${isDropdownOpen ? styles.open : ''}`}
            onClick={toggleDropdown}
          >
            {selectedLineId && selectedLine ? (
              <span className={styles.optionLine}>
                <span className={styles.colorDot} style={{ backgroundColor: selectedLine.color }} />
                {selectedLine.name}
              </span>
            ) : (
              <span className={styles.placeholder}>{t('linePlaceholder')}</span>
            )}
            <span className={styles.arrow}>▼</span>
          </div>

          {isDropdownOpen &&
            createPortal(
              <div
                ref={dropdownRef}
                className={styles.dropdownMenu}
                style={{
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: dropdownPosition.width,
                }}
              >
                {lines.length === 0 ? (
                  <div className={styles.dropdownEmpty}>{t('noLines')}</div>
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
                        <span className={styles.colorDot} style={{ backgroundColor: line.color }} />
                        {line.name}
                      </span>
                    </div>
                  ))
                )}
              </div>,
              document.body
            )}
        </div>
      </div>

      <div className={styles.coordinates}>
        <span>{t('coordinates', { x: Math.round(position.x), y: Math.round(position.y) })}</span>
      </div>

      <div className={styles.spacer} />

      <div className={styles.actions}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={!stationName.trim() || !selectedLineId || isLoading}
          className={styles.submitButton}
        >
          {isLoading ? t('submitting') : t('submit')}
        </button>
      </div>
    </form>
  )
}
