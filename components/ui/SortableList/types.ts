export interface SortableItemData {
  id: string
}

export interface DragState {
  startY: number
  startScrollTop: number
  itemHeight: number
  isDragging: boolean
  lastClientY: number
}
