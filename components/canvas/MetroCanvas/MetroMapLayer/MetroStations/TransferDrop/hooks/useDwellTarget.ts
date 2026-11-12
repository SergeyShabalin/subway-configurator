import { useCallback, useEffect, useRef, useState } from 'react'

export interface DwellState {
  id: string
  armed: boolean
}

/** Держит текущую цель и переводит её в armed, если она не менялась delayMs */
export const useDwellTarget = (delayMs: number) => {
  const [state, setState] = useState<DwellState | null>(null)
  const stateRef = useRef<DwellState | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const commit = useCallback((next: DwellState | null) => {
    stateRef.current = next
    setState(next)
  }, [])

  const clearTimer = useCallback(() => {
    if (timerRef.current === null) return
    clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  const track = useCallback(
    (id: string | null) => {
      if ((stateRef.current?.id ?? null) === id) return

      clearTimer()

      if (id === null) {
        commit(null)
        return
      }

      commit({ id, armed: false })
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        commit({ id, armed: true })
      }, delayMs)
    },
    [clearTimer, commit, delayMs]
  )

  const read = useCallback(() => stateRef.current, [])

  useEffect(() => clearTimer, [clearTimer])

  return { state, track, read }
}
