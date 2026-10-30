import { useEffect, type MutableRefObject, type RefObject } from 'react'

const SCROLL_SPEED = 8

interface UseAutoScrollOptions {
  containerRef: RefObject<HTMLElement | null>
  isEnabled: boolean
  scrollDirection: MutableRefObject<number>
  onScroll: () => void
}

export const useAutoScroll = ({
  containerRef,
  isEnabled,
  scrollDirection,
  onScroll,
}: UseAutoScrollOptions) => {
  useEffect(() => {
    if (!isEnabled) return
    let rafId: number

    const loop = () => {
      const container = containerRef.current
      const dir = scrollDirection.current

      if (container && dir !== 0) {
        const canScrollUp = dir === -1 && container.scrollTop > 0
        const canScrollDown =
          dir === 1 && container.scrollTop < container.scrollHeight - container.clientHeight

        if (canScrollUp || canScrollDown) {
          container.scrollTop += dir * SCROLL_SPEED
          onScroll()
        }
      }
      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [containerRef, isEnabled, scrollDirection, onScroll])
}
