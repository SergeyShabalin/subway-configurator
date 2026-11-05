import { VerticalTimelineListProps } from '@/components/ui/VerticalTimelineList/types'
import type { CSSProperties } from 'react'
import styles from './VerticalTimelineList.module.css'

export const VerticalTimelineList = ({
  items,
  color,
  variant = 'single',
}: VerticalTimelineListProps) => {
  if (items.length === 0) return null

  const isDouble = variant === 'double'

  // single: сплошная заливка, double: цвет идёт в границы, середина прозрачная
  const lineStyle: CSSProperties = isDouble ? { borderColor: color } : { backgroundColor: color }

  return (
    <div className={styles.container}>
      <div className={`${styles.line} ${isDouble ? styles.lineDouble : ''}`} style={lineStyle} />
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <div className={styles.dot} style={{ borderColor: color }} />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
