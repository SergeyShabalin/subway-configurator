import { VerticalTimelineListProps } from '@/components/ui/VerticalTimelineList/types'
import styles from './VerticalTimelineList.module.css'

export const VerticalTimelineList = ({ items, color }: VerticalTimelineListProps) => {
  if (items.length === 0) return null

  return (
    <div className={styles.container}>
      <div className={styles.line} style={{ backgroundColor: color }} />
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
