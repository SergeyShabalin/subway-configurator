import type { CSSProperties, ReactNode } from 'react'
import styles from './InfoRow.module.css'

interface InfoRowProps {
  label?: ReactNode
  value?: ReactNode
  description?: ReactNode
  color?: string
  indicatorType?: 'dot' | 'bar'
}

export const InfoRow = ({
  label,
  value,
  description,
  color,
  indicatorType = 'dot',
}: InfoRowProps) => {
  return (
    <div className={styles.row}>
      {label && <span className={styles.label}>{label}</span>}

      <div className={styles.content}>
        <div className={styles.value}>
          {color && (
            <span
              className={indicatorType === 'dot' ? styles.dot : styles.indicator}
              style={{ '--accent-color': color } as CSSProperties}
            />
          )}

          <span className={styles.valueText}>{value}</span>
        </div>

        {description && <span className={styles.description}>{description}</span>}
      </div>
    </div>
  )
}
