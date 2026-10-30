import type { PointerEvent, ReactNode } from 'react'
import { DragHandle } from './DragHandle/DragHandle'
import styles from './SortableItem.module.css'

interface SortableItemProps {
  children: ReactNode
  offsetY: number
  isDragging: boolean
  isTransitionEnabled: boolean
  onPointerDown: (e: PointerEvent<HTMLButtonElement>) => void
}

export const SortableItem = ({
  children,
  offsetY,
  isDragging,
  isTransitionEnabled,
  onPointerDown,
}: SortableItemProps) => (
  <li
    className={`${styles.item} ${isDragging ? styles.dragging : ''}`}
    style={{
      transform: offsetY ? `translateY(${offsetY}px)` : undefined,
      transition: isTransitionEnabled ? 'transform 0.1s ease, background-color 0.1s ease' : 'none',
      zIndex: isDragging ? 10 : 1,
    }}
  >
    <DragHandle onPointerDown={onPointerDown} />
    <div className={styles.content}>{children}</div>
  </li>
)
