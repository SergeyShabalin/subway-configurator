'use client'

import { AddStationForm } from '@/components/canvas/features'
import { Modal } from '@/components/ui/Modal/Modal'
import { Tabs } from '@/components/ui/Tabs'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingClose, setPendingClose] = useState(false)

  useEffect(() => {
    if (!pendingClose) return
    if (isSubmitting) return

    const timer = setTimeout(() => {
      setPendingClose(false)
      onClose()
    }, 200)

    return () => clearTimeout(timer)
  }, [pendingClose, isSubmitting, onClose])

  const handleSuccess = useCallback((cb?: () => void) => {
    cb?.()
    setPendingClose(true)
  }, [])

  if (!isOpen) return null

  return (
    <Modal
      key={isOpen ? 'open' : 'closed'}
      isOpen={isOpen}
      onClose={onClose}
      title={t('title')}
      size="medium"
      disableClose={isSubmitting || pendingClose}
    >
      <div className={styles.modalContent}>
        <Tabs<TabType>
          value={activeTab}
          onChange={setActiveTab}
          tabs={[
            { value: 'line', label: t('tabLine') },
            { value: 'station', label: t('tabStation') },
          ]}
        />

        <div className={styles.formWrapper}>
          {activeTab === 'line' && (
            <AddLineForm
              onSuccess={() => handleSuccess(onLineAdded)}
              onCancel={onClose}
              onLoadingChange={setIsSubmitting}
            />
          )}

          {activeTab === 'station' && (
            <AddStationForm
              position={position}
              onSuccess={() => handleSuccess(onStationAdded)}
              onCancel={onClose}
              onLoadingChange={setIsSubmitting}
            />
          )}
        </div>
      </div>
    </Modal>
  )
}
