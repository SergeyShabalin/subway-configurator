'use client'

import { useRef, type ReactNode } from 'react'
import { useSortableList } from './hooks/useSortableList'
import { SortableItem } from './SortableItem/SortableItem'
import styles from './SortableList.module.css'
import type { SortableItemData } from './types'

interface SortableListProps<T extends SortableItemData> {
  items: Array<T>
  onReorder: (items: Array<T>) => void
  renderItem: (item: T, index: number) => ReactNode
}

export function SortableList<T extends SortableItemData>({
  items,
  onReorder,
  renderItem,
}: SortableListProps<T>) {
  const listRef = useRef<HTMLUListElement>(null)

  const {
    dragIndex,
    overIndex,
    dragOffset,
    isDropping,
    isDragging,
    itemHeight,
    handlePointerDown,
  } = useSortableList({ items, onReorder, listRef })

  return (
    <ul className={styles.list} ref={listRef}>
      {items.map((item, index) => {
        let offsetY = 0
        let isItemDragging = false

        if (dragIndex !== null && overIndex !== null && isDragging) {
          if (index === dragIndex) {
            offsetY = dragOffset
            isItemDragging = true
          } else if (dragIndex < overIndex && index > dragIndex && index <= overIndex) {
            offsetY = -itemHeight
          } else if (dragIndex > overIndex && index < dragIndex && index >= overIndex) {
            offsetY = itemHeight
          }
        }

        return (
          <SortableItem
            key={item.id}
            offsetY={offsetY}
            isDragging={isItemDragging}
            isTransitionEnabled={isItemDragging ? isDropping : true}
            onPointerDown={(e) => handlePointerDown(e, index)}
          >
            {renderItem(item, index)}
          </SortableItem>
        )
      })}
    </ul>
  )
}
