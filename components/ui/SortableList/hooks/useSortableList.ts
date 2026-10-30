import { useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react'
import type { SortableItemData } from '../types'
import { useAutoScroll } from './useAutoScroll'

const ACTIVATION_DISTANCE = 4
const SCROLL_THRESHOLD = 40

interface UseSortableListOptions<T extends SortableItemData> {
  items: Array<T>
  onReorder: (items: Array<T>) => void
  listRef: RefObject<HTMLUListElement | null>
}

export function useSortableList<T extends SortableItemData>({
  items,
  onReorder,
  listRef,
}: UseSortableListOptions<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDropping, setIsDropping] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [itemHeight, setItemHeight] = useState(0)

  const dragState = useRef({
    startY: 0,
    startScrollTop: 0,
    lastClientY: 0,
  })

  const scrollDirRef = useRef(0)
  const overIndexRef = useRef<number | null>(null)

  useEffect(() => {
    overIndexRef.current = overIndex
  }, [overIndex])

  // Сохраняем самую свежую версию функции, чтобы не пересоздавать слушатели
  const updatePosition = (clientY: number) => {
    if (!listRef.current || dragIndex === null || itemHeight === 0) return
    const state = dragState.current

    const scrollDelta = listRef.current.scrollTop - state.startScrollTop
    const rawDeltaY = clientY - state.startY + scrollDelta

    const maxOffset = (items.length - 1 - dragIndex) * itemHeight
    const minOffset = -dragIndex * itemHeight
    const clampedOffset = Math.max(minOffset, Math.min(rawDeltaY, maxOffset))

    setDragOffset(clampedOffset)

    const offsetIndex = Math.round(clampedOffset / itemHeight)
    let newOverIndex = dragIndex + offsetIndex
    if (newOverIndex < 0) newOverIndex = 0
    if (newOverIndex >= items.length) newOverIndex = items.length - 1

    if (newOverIndex !== overIndexRef.current) {
      setOverIndex(newOverIndex)
    }

    const rect = listRef.current.getBoundingClientRect()
    if (clientY < rect.top + SCROLL_THRESHOLD) {
      scrollDirRef.current = -1
    } else if (clientY > rect.bottom - SCROLL_THRESHOLD) {
      scrollDirRef.current = 1
    } else {
      scrollDirRef.current = 0
    }
  }

  const updatePositionRef = useRef(updatePosition)

  // Обновляем ref при каждом рендере, чтобы window-слушатели видели актуальные данные
  useEffect(() => {
    updatePositionRef.current = updatePosition
  })

  useAutoScroll({
    containerRef: listRef,
    isEnabled: isDragging && !isDropping,
    scrollDirection: scrollDirRef,
    onScroll: () => updatePositionRef.current(dragState.current.lastClientY),
  })

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>, index: number) => {
    if (items.length < 2 || isDropping) return
    const li = e.currentTarget.closest('li')
    if (!li || !listRef.current) return

    const style = window.getComputedStyle(li)
    const marginBottom = parseFloat(style.marginBottom) || 0
    const height = li.getBoundingClientRect().height + marginBottom

    dragState.current = {
      startY: e.clientY,
      startScrollTop: listRef.current.scrollTop,
      lastClientY: e.clientY,
    }

    setItemHeight(height)
    setDragIndex(index)
    setOverIndex(index)
    setDragOffset(0)
    setIsDropping(false)
    setIsDragging(false)
  }

  useEffect(() => {
    if (dragIndex === null) return

    const handlePointerMove = (e: globalThis.PointerEvent) => {
      if (isDropping) return
      const state = dragState.current
      state.lastClientY = e.clientY

      if (!isDragging) {
        if (Math.abs(e.clientY - state.startY) < ACTIVATION_DISTANCE) return
        setIsDragging(true)
        document.body.style.cursor = 'grabbing'
        document.body.style.userSelect = 'none'
      }

      updatePositionRef.current(e.clientY)
    }

    const handlePointerUp = () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      setIsDragging(false)
      scrollDirRef.current = 0

      if (
        dragIndex !== null &&
        overIndexRef.current !== null &&
        overIndexRef.current !== dragIndex
      ) {
        setIsDropping(true)

        requestAnimationFrame(() => {
          const finalOffset = (overIndexRef.current! - dragIndex) * itemHeight
          setDragOffset(finalOffset)

          setTimeout(() => {
            const newItems = [...items]
            const [moved] = newItems.splice(dragIndex, 1)
            newItems.splice(overIndexRef.current!, 0, moved)
            onReorder(newItems)

            setDragIndex(null)
            setOverIndex(null)
            setIsDropping(false)
            setDragOffset(0)
          }, 200)
        })
      } else {
        setDragIndex(null)
        setOverIndex(null)
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [dragIndex, items, onReorder, isDropping, isDragging, itemHeight])

  return {
    dragIndex,
    overIndex,
    dragOffset,
    isDropping,
    isDragging,
    itemHeight,
    handlePointerDown,
  }
}
