'use client'

import { AddStationForm } from '@/components/canvas/features'
import { Modal } from '@/components/ui/Modal/Modal'
import { Tabs } from '@/components/ui/Tabs'
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
  onAdded?: () => void
}

type TabType = 'station' | 'line'

export const AddElementModal = ({
  isOpen,
  onClose,
  position,
  initialTab = 'station',
  onAdded,
}: AddElementModalProps) => {
  const t = useTranslations('AddElementModal')
  const ArrayOfTabs = [
    { value: 'line' as const, label: t('tabLine') },
    { value: 'station' as const, label: t('tabStation') },
  ]

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

  const handleSuccess = () => {
    onAdded?.()
    setPendingClose(true)
  }

  if (!isOpen) return null

  return (
    <Modal
      key={isOpen ? 'open' : 'closed'}
      isOpen={isOpen}
      onClose={onClose}
      title={t('title')}
      disableClose={isSubmitting || pendingClose}
    >
      <div className={styles.modalContent}>
        <Tabs value={activeTab} onChange={setActiveTab} tabs={ArrayOfTabs} />

        <div className={styles.formWrapper}>
          {activeTab === 'line' && (
            <AddLineForm
              onSuccess={handleSuccess}
              onCancel={onClose}
              onLoadingChange={setIsSubmitting}
            />
          )}

          {activeTab === 'station' && (
            <AddStationForm
              position={position}
              onSuccess={handleSuccess}
              onCancel={onClose}
              onLoadingChange={setIsSubmitting}
            />
          )}
        </div>
      </div>
    </Modal>
  )
}
