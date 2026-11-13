'use client'

import { useSelectedSegmentData } from '@/components/canvas/MetroCanvas/hooks/useSelectedSegmentData'
import { LineTab } from '@/components/canvas/MetroCanvas/MetroCanvasDialogs/EditLine/LineTab/LineTab'
import { SegmentTab } from '@/components/canvas/MetroCanvas/MetroCanvasDialogs/EditLine/SegmentTab/SegmentTab'
import { StationsTab } from '@/components/canvas/MetroCanvas/MetroCanvasDialogs/EditLine/StationsTab/StationsTab'
import type { SelectedSegment } from '@/components/canvas/MetroCanvas/MetroMapLayer/MetroLines/types'
import { LineIcon } from '@/components/ui/Icons'
import { Modal } from '@/components/ui/Modal/Modal'
import { Tabs } from '@/components/ui/Tabs'
import { useTranslations } from 'next-intl'
import { AlignStationsTab } from './AlignStationsTab/AlignStationsTab'
import styles from './EditLine.module.css'
import { getSegmentKey } from './helpers/getSegmentKey'
import { useCurrentLine } from './hooks/useCurrentLine'
import { useEditLineActions } from './hooks/useEditLineActions'
import { useEditLineTabs } from './hooks/useEditLineTabs'

interface EditLineProps {
  isOpen: boolean
  selectedSegment: SelectedSegment | null
  onClose: () => void
  reloadData: () => Promise<void>
}

export const EditLine = ({ isOpen, selectedSegment, onClose, reloadData }: EditLineProps) => {
  const t = useTranslations('EditLine')

  const currentLine = useCurrentLine(selectedSegment)
  const segment = useSelectedSegmentData(selectedSegment)

  const { tabs, currentTab, selectTab } = useEditLineTabs({
    hasSegment: Boolean(segment?.segmentId),
  })
  const { saveSegmentTime, reorderStations } = useEditLineActions({
    line: currentLine,
    segmentId: segment?.segmentId,
    reloadData,
  })

  const segmentKey = getSegmentKey(selectedSegment)

  if (!isOpen || !currentLine) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')} icon={<LineIcon />}>
      <div className={styles.modalContent}>
        <Tabs value={currentTab} onChange={selectTab} tabs={tabs} />

        {currentTab === 'segment' && segment && (
          <SegmentTab
            key={segmentKey}
            segment={segment}
            onSave={saveSegmentTime}
            onClose={onClose}
          />
        )}

        {currentTab === 'line' && (
          <LineTab line={currentLine} onClose={onClose} reloadData={reloadData} />
        )}

        {currentTab === 'stations' && (
          <StationsTab line={currentLine} onReorder={reorderStations} />
        )}

        {currentTab === 'align' && <AlignStationsTab line={currentLine} />}
      </div>
    </Modal>
  )
}
