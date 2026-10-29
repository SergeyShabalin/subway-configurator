  'use client'

  import { CreateLineForm } from '@/components/canvas/features/CreateElement/CreateElementModal/CreateLineForm/CreateLineForm'
  import { CreateStationForm } from '@/components/canvas/features/CreateElement/CreateElementModal/CreateStationForm/CreateStationForm'
  import type { DropdownOption } from '@/components/ui/Dropdown'
  import { LineIcon } from '@/components/ui/Icons/LineIcon/LineIcon'
  import { StationIcon } from '@/components/ui/Icons/StationIcon/StationIcon'
  import { Modal } from '@/components/ui/Modal/Modal'
  import { Tabs } from '@/components/ui/Tabs'
  import { useTranslations } from 'next-intl'
  import { useEffect, useState } from 'react'
  import type { CreateLinePayload, CreateStationPayload, TransferNode } from '../types'
  import styles from './CreateElementModal.module.css'

  type TabType = 'station' | 'line'

  interface AddElementModalProps {
    isOpen: boolean
    onClose: () => void
    position: { x: number; y: number }
    initialTab?: TabType
    lineOptions: Array<DropdownOption<string>>
    transferNodes: Array<TransferNode>
    onCreateStation: (data: CreateStationPayload) => Promise<void>
    onCreateLine: (data: CreateLinePayload) => Promise<void>
  }

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
        icon={activeTab === 'line' ? <LineIcon /> : <StationIcon />}
      >
        <div className={styles.modalContent}>
          <Tabs value={activeTab} onChange={setActiveTab} tabs={ArrayOfTabs} />

          <div className={styles.formWrapper}>
            {activeTab === 'line' && (
              <CreateLineForm
                onSubmit={onCreateLine}
                onSuccess={handleSuccess}
                onCancel={onClose}
                onLoadingChange={setIsSubmitting}
              />
            )}
            {activeTab === 'station' && (
              <CreateStationForm
                position={position}
                lineOptions={lineOptions}
                transferNodes={transferNodes}
                onSubmit={onCreateStation}
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
