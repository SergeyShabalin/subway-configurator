'use client'

import { Button } from '@/components/ui/Button'
import { InfoRow } from '@/components/ui/InfoRow/InfoRow'
import { useTranslations } from 'next-intl'
import type { TransferItem } from '../../types'
import styles from '../EditStationModal.module.css'

interface StationTransfersSectionProps {
  transfers: Array<TransferItem>
  canCreate: boolean
  onCreate: () => void
}

export const StationTransfersSection = ({
  transfers,
  canCreate,
  onCreate,
}: StationTransfersSectionProps) => {
  const t = useTranslations('EditStation')

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>{t('transfers')}</span>

        <Button
          title={t('createTransfer')}
          variant="outlineColored"
          color="primary"
          size="small"
          onClick={onCreate}
          disabled={!canCreate}
        />
      </div>

      {transfers.length === 0 ? (
        <div className={styles.emptyTransfers}>{t('noTransfers')}</div>
      ) : (
        <ul className={styles.transferList}>
          {transfers.map((transfer) => (
            <li key={transfer.id}>
              <InfoRow
                value={transfer.otherStationName}
                description={`${transfer.timeMinutes} ${t('transferTimeLabel')}`}
                color={transfer.color}
                indicatorType="bar"
                descriptionIndicator={transfer.color}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
