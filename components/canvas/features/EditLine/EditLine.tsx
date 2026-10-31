'use client'

import { EditLineForm } from '@/components/canvas/features/EditLine/EditLineForm/EditLineForm'
import type { SelectedSegment } from '@/components/canvas/MetroCanvas/MetroLines/types'
import { LineIcon } from '@/components/ui/Icons'
import { Modal } from '@/components/ui/Modal/Modal'
import { Tabs } from '@/components/ui/Tabs'
import { linesService, segmentsService } from '@/src/lib/services'
import { useMetroStore } from '@/store'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { useSelectedSegmentData } from '../../MetroCanvas/hooks/useSelectedSegmentData'
import styles from './EditLine.module.css'
import { EditSegmentModal } from './EditSegmentModal/EditSegmentModal'
import { useLineStations } from './hooks/useLineStations'
import { LineStationsTab } from './LineStationsTab/LineStationsTab'

type TabType = 'segment' | 'line' | 'stations'

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
  const lineStations = useLineStations(selectedSegment?.lineId)

  const currentLine = useMemo(() => {
    if (!selectedSegment) return null
    return lines.find((l) => String(l.id) === String(selectedSegment.lineId)) ?? null
  }, [lines, selectedSegment])

  const segmentKey = selectedSegment
    ? `${selectedSegment.lineId}-${selectedSegment.fromVisualId}-${selectedSegment.toVisualId}`
    : 'empty'

  // После перестановки выбранного участка может уже не быть
  const hasSegment = Boolean(segmentData?.segmentId)
  const currentTab: TabType = activeTab === 'segment' && !hasSegment ? 'line' : activeTab

  const handleSegmentSave = async (timeMinutes: number) => {
    if (!segmentData?.segmentId) return
    await segmentsService.updateTime(segmentData.segmentId, timeMinutes)
    await reloadData()
  }

  const handleStationsReorder = async (orderedStationIds: Array<string>) => {
    if (!currentLine) return
    await linesService.reorderStations(String(currentLine.id), orderedStationIds)
    await reloadData()
  }

  const tabs = [
    { value: 'line' as const, label: t('tabLine') },
    ...(hasSegment ? [{ value: 'segment' as const, label: t('tabSegment') }] : []),
    { value: 'stations' as const, label: t('tabStations') },
  ]

  if (!isOpen || !currentLine) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')} icon={<LineIcon />}>
      <div className={styles.modalContent}>
        <Tabs value={currentTab} onChange={setActiveTab} tabs={tabs} />

        {currentTab === 'segment' && segmentData && (
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

        {currentTab === 'line' && (
          <EditLineForm line={currentLine} onClose={onClose} reloadData={reloadData} />
        )}

        {currentTab === 'stations' && (
          <LineStationsTab stations={lineStations} onReorder={handleStationsReorder} />
        )}
      </div>
    </Modal>
  )
}
