import { useNodeOptions } from '@/components/canvas/shared/options/useNodeOptions'
import { filterTransferTargets } from '@/components/canvas/shared/transfers/filterTransferTargets'
import { getExistingTransferTargetIds } from '@/components/canvas/shared/transfers/getExistingTransferTargetIds'
import { useMetroStoreApi } from '@/store'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { DWELL_MS, HIT_DISTANCE } from '../constants'
import { findDropTarget } from '../helpers/findDropTarget'
import type { TransferDraft, TransferDropApi } from '../types'
import { useDwellTarget } from './useDwellTarget'

interface Point {
  x: number
  y: number
}

interface Session {
  fromId: string
  start: Point
  last: Point
  targets: Set<string>
}

interface UseTransferDropParams {
  onDrop: (draft: TransferDraft) => void
}

export const useTransferDrop = ({ onDrop }: UseTransferDropParams): TransferDropApi => {
  const store = useMetroStoreApi()
  const nodeOptions = useNodeOptions()
  const { state, track, read } = useDwellTarget(DWELL_MS)

  const nodeOptionsRef = useRef(nodeOptions)
  useEffect(() => {
    nodeOptionsRef.current = nodeOptions
  }, [nodeOptions])

  const sessionRef = useRef<Session | null>(null)

  const startSession = useCallback(
    (visualId: string): Session | null => {
      const { visuals, visualTransfers } = store.getState()
      const visual = visuals[visualId]
      if (!visual) return null

      const existingIds = getExistingTransferTargetIds(visualTransfers ?? [], visualId)
      const targets = new Set(
        filterTransferTargets(nodeOptionsRef.current, visualId, existingIds).map((o) => o.value)
      )

      const start = { x: visual.x, y: visual.y }
      return { fromId: visualId, start, last: start, targets }
    },
    [store]
  )

  const move = useCallback(
    (visualId: string, x: number, y: number) => {
      if (sessionRef.current?.fromId !== visualId) {
        sessionRef.current = startSession(visualId)
      }

      const session = sessionRef.current
      if (!session) return

      session.last = { x, y }

      const { visuals } = store.getState()
      const candidates: Array<{ id: string; x: number; y: number }> = []

      for (const id of session.targets) {
        const visual = visuals[id]
        if (visual) candidates.push({ id, x: visual.x, y: visual.y })
      }

      track(findDropTarget({ x, y }, candidates, HIT_DISTANCE))
    },
    [startSession, store, track]
  )

  const end = useCallback(
    (visualId: string): boolean => {
      const session = sessionRef.current
      const current = read()

      sessionRef.current = null
      track(null)

      if (!session || session.fromId !== visualId || !current?.armed) return false

      // Станция возвращается на место: наложение на цель не сохраняем
      store.getState().updateVisualPosition(visualId, session.start.x, session.start.y)
      onDrop({ fromVisualId: visualId, toVisualId: current.id, dropPosition: session.last })
      return true
    },
    [onDrop, read, store, track]
  )

  return useMemo(
    () => ({
      target: state ? { visualId: state.id, armed: state.armed } : null,
      move,
      end,
    }),
    [state, move, end]
  )
}
