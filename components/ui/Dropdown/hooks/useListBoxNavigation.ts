import { useCallback, useState, type KeyboardEvent } from 'react'

interface Params {
  itemCount: number
  resetKey: unknown // при изменении активный индекс сбрасывается на 0 (например, query)
  onSelectIndex: (index: number) => void
  onClose: () => void
}

export const useListBoxNavigation = ({ itemCount, resetKey, onSelectIndex, onClose }: Params) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [prevResetKey, setPrevResetKey] = useState(resetKey)

  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey)
    setActiveIndex(0)
  }

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const handlers: Record<string, () => void> = {
        ArrowDown: () => {
          if (itemCount > 0) setActiveIndex((i) => (i + 1) % itemCount)
        },
        ArrowUp: () => {
          if (itemCount > 0) setActiveIndex((i) => (i - 1 + itemCount) % itemCount)
        },
        Enter: () => {
          if (itemCount > 0) onSelectIndex(activeIndex)
        },
        Escape: () => {
          onClose()
        },
      }

      const handler = handlers[e.key]
      if (!handler) return

      e.preventDefault()
      handler()
    },
    [itemCount, activeIndex, onSelectIndex, onClose]
  )

  return { activeIndex, setActiveIndex, onKeyDown }
}
