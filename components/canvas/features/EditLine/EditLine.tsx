'use client'

import type { SelectedSegment } from '@/components/canvas/MetroCanvas/MetroLines/types'
import { LineIcon } from '@/components/ui/Icons/LineIcon/LineIcon'
import { Modal } from '@/components/ui/Modal/Modal'
import { Tabs } from '@/components/ui/Tabs'
import { segmentsService } from '@/src/lib/services'
import { useMetroStore } from '@/store'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { useSelectedSegmentData } from '../../MetroCanvas/hooks/useSelectedSegmentData'
import styles from './EditLine.module.css'
import { EditLineForm } from './EditLineModal/EditLineForm'
import { EditSegmentModal } from './EditSegmentModal/EditSegmentModal'

type TabType = 'segment' | 'line'

interface EditLineProps {
  isOpen: boolean
  selectedSegment: SelectedSegment | null
  onClose: () => void
  reloadData: () => Promise<void>
}

export const EditLine = ({ isOpen, selectedSegment, onClose, reloadData }: EditLineProps) => {
  const t = useTranslations('EditLine')
  const lines = useMetroStore((state) => state.lines)

  const [activeTab, setActiveTab] = useState<TabType>('segment')

  const segmentData = useSelectedSegmentData(selectedSegment)

  const currentLine = useMemo(() => {
    if (!selectedSegment) return null
    return lines.find((l) => String(l.id) === String(selectedSegment.lineId)) ?? null
  }, [lines, selectedSegment])

  const segmentKey = selectedSegment
    ? `${selectedSegment.lineId}-${selectedSegment.fromVisualId}-${selectedSegment.toVisualId}`
    : 'empty'

  const handleSegmentSave = async (timeMinutes: number) => {
    if (!segmentData?.segmentId) return
    await segmentsService.updateTime(segmentData.segmentId, timeMinutes)
    await reloadData()
  }

  const ArrayOfTabs = [
    { value: 'line' as const, label: t('tabLine') },
    { value: 'segment' as const, label: t('tabSegment') },
  ]

  if (!isOpen) return null
  if (!segmentData) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')} icon={<LineIcon />}>
      <div className={styles.modalContent}>
        <Tabs value={activeTab} onChange={setActiveTab} tabs={ArrayOfTabs} />

        {activeTab === 'segment' && (
          <EditSegmentModal
            key={segmentKey}
            onClose={onClose}
            fromStationName={segmentData.fromStationName}
            toStationName={segmentData.toStationName}
            timeMinutes={segmentData.timeMinutes}
            lineName={segmentData.lineName}
            lineColor={segmentData.lineColor}
            onSave={handleSegmentSave}
          />
        )}

        {activeTab === 'line' && currentLine && (
          <EditLineForm line={currentLine} onClose={onClose} reloadData={reloadData} />
        )}
      </div>
    </Modal>
  )
}
