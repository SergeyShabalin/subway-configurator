'use client'

import { CreateLineForm } from '@/components/canvas/features/CreateElement/CreateElementModal/CreateLineForm/CreateLineForm'
import { CreateStationForm } from '@/components/canvas/features/CreateElement/CreateElementModal/CreateStationForm/CreateStationForm'
import { LineIcon } from '@/components/ui/Icons/LineIcon/LineIcon'
import { StationIcon } from '@/components/ui/Icons/StationIcon/StationIcon'
import { Modal } from '@/components/ui/Modal/Modal'
import { Tabs } from '@/components/ui/Tabs'
import { useTranslations } from 'next-intl'
import { useEffect, useState, type ReactNode } from 'react'
import styles from './CreateElementModal.module.css'
import type { AddElementModalProps, TabType } from './types'

export const CreateElementModal = ({
  isOpen,
  onClose,
  position,
  initialTab = 'station',
  lineOptions,
  transferNodes,
  onCreateStation,
  onCreateLine,
}: AddElementModalProps) => {
  const t = useTranslations('CreateElementModal')

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
    setPendingClose(true)
  }

  if (!isOpen) return null

  const tabConfig: Record<TabType, { label: string; icon: ReactNode }> = {
    line: { label: t('tabLine'), icon: <LineIcon /> },
    station: { label: t('tabStation'), icon: <StationIcon /> },
  }

  const tabs = Object.entries(tabConfig).map(([value, config]) => ({
    value: value as TabType,
    label: config.label,
  }))

  const forms: Record<TabType, ReactNode> = {
    line: (
      <CreateLineForm
        onSubmit={onCreateLine}
        onSuccess={handleSuccess}
        onCancel={onClose}
        onLoadingChange={setIsSubmitting}
      />
    ),
    station: (
      <CreateStationForm
        position={position}
        lineOptions={lineOptions}
        transferNodes={transferNodes}
        onSubmit={onCreateStation}
        onSuccess={handleSuccess}
        onCancel={onClose}
        onLoadingChange={setIsSubmitting}
      />
    ),
  }

  return (
    <Modal
      key={isOpen ? 'open' : 'closed'}
      isOpen={isOpen}
      onClose={onClose}
      title={t('title')}
      disableClose={isSubmitting || pendingClose}
      icon={tabConfig[activeTab].icon}
    >
      <div className={styles.modalContent}>
        <Tabs value={activeTab} onChange={setActiveTab} tabs={tabs} />

        <div className={styles.formWrapper}>{forms[activeTab]}</div>
      </div>
    </Modal>
  )
}
