'use client'

import { stationsService } from '@/src/lib/services'
import { useMetroStore } from '@/store'
import { useTranslations } from 'next-intl'
import styles from './ChangeLabelForm.module.css'

interface ChangeLabelFormProps {
  stationId: string
  onSuccess?: () => Promise<void>
}

const ChangeLabelForm = ({ stationId, onSuccess }: ChangeLabelFormProps) => {
  const t = useTranslations('ChangeLabelForm')

  const station = useMetroStore((state) =>
    state.stations.find((station) => station.id === stationId)
  )

  const handleDelete = async () => {
    if (!station) return

    const confirmed = window.confirm(t('confirmDelete', { name: station.name }))

    if (!confirmed) return

    await stationsService.delete(stationId)
    await onSuccess?.()
  }

  if (!station) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <div className={styles.row}>
          <span className={styles.label}>{t('id')}</span>
          <span className={styles.value}>{station.id}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>{t('name')}</span>
          <span className={styles.value}>{station.name}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>{t('lineId')}</span>
          <span className={styles.value}>{station.line_id}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.deleteButton} onClick={handleDelete}>
          {t('delete')}
        </button>
      </div>
    </div>
  )
}

export { ChangeLabelForm }
