'use client'

import { AddStationForm } from '@/components/canvas/features'
import { Modal } from '@/components/ui/Modal/Modal'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { AddLineForm } from '../AddLineForm/AddLineForm'
import styles from './AddElementModal.module.css'

interface AddElementModalProps {
  isOpen: boolean
  onClose: () => void
  position: { x: number; y: number }
  initialTab?: TabType
  onStationAdded?: () => void
  onLineAdded?: () => void
}

type TabType = 'station' | 'line'

export const AddElementModal = ({
  isOpen,
  onClose,
  position,
  initialTab = 'station',
  onStationAdded,
  onLineAdded,
}: AddElementModalProps) => {
  const t = useTranslations('AddElementModal')
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')} size="medium">
      <div className={styles.modalContent}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'line' ? styles.active : ''}`}
            onClick={() => setActiveTab('line')}
          >
            {t('tabLine')}
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'station' ? styles.active : ''}`}
            onClick={() => setActiveTab('station')}
          >
            {t('tabStation')}
          </button>
        </div>

        <div className={styles.formWrapper}>
          {activeTab === 'line' && (
            <AddLineForm
              onSuccess={() => {
                onLineAdded?.()
                onClose()
              }}
              onCancel={onClose}
            />
          )}

          {activeTab === 'station' && (
            <AddStationForm
              position={position}
              onSuccess={() => {
                onStationAdded?.()
                onClose()
              }}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </Modal>
  )
}
