import type { CSSProperties, ReactNode } from 'react'
import styles from './InfoRow.module.css'

interface InfoRowProps {
  label?: ReactNode
  value?: ReactNode
  description?: ReactNode
  color?: string
  indicatorType?: 'dot' | 'bar'
  descriptionIndicator?: string
}

export const InfoRow = ({
  label,
  value,
  description,
  color,
  indicatorType = 'dot',
  descriptionIndicator,
}: InfoRowProps) => {
  return (
    <div className={`${styles.row} ${color ? styles.hasIndicator : ''}`}>
      {color && (
        <span
          aria-hidden="true"
          className={indicatorType === 'dot' ? styles.dot : styles.indicator}
          style={{ '--accent-color': color } as CSSProperties}
        />
      )}

      <div className={styles.body}>
        {label && <span className={styles.label}>{label}</span>}

        <div className={styles.content}>
          <span className={styles.valueText}>{value}</span>

          {description && (
            <span className={styles.description}>
              {descriptionIndicator && (
                <span
                  className={styles.descriptionDot}
                  style={{ '--accent-color': descriptionIndicator } as CSSProperties}
                  aria-hidden="true"
                />
              )}
              {description}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
