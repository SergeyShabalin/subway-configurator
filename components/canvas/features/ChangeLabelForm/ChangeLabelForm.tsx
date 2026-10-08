'use client'

import { stationsService } from '@/src/lib/services'
import { useMetroStore } from '@/store'
import styles from './ChangeLabelForm.module.css'

interface ChangeLabelFormProps {
  stationId: string
  onSuccess?: () => Promise<void>
}

const ChangeLabelForm = ({ stationId, onSuccess }: ChangeLabelFormProps) => {
  const station = useMetroStore((state) =>
    state.stations.find((station) => station.id === stationId)
  )

  const handleDelete = async () => {
    if (!station) return

    const confirmed = window.confirm(`Вы действительно хотите удалить станцию "${station.name}"?`)

    if (!confirmed) return

    try {
      await stationsService.delete(stationId)
      await onSuccess?.()
    } catch (error) {
      console.error('Error deleting station:', error)
      alert('Не удалось удалить станцию')
    }
  }

  if (!station) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <div className={styles.row}>
          <span className={styles.label}>ID</span>
          <span className={styles.value}>{station.id}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Name</span>
          <span className={styles.value}>{station.name}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Line ID</span>
          <span className={styles.value}>{station.line_id}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.deleteButton} onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  )
}

export { ChangeLabelForm }
