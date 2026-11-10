import { useLineOptions } from '@/components/canvas/shared/options/useLineOptions'
import { useMetroStore } from '@/store'
import { useMemo } from 'react'
import { buildTransferNodes } from '../helpers/buildTransferNodes'
import type { TransferNode } from '../types'

interface CreateElementData {
  lineOptions: ReturnType<typeof useLineOptions>
  transferNodes: Array<TransferNode>
  hasLines: boolean
}

export const useCreateElementData = (): CreateElementData => {
  const lines = useMetroStore((state) => state.lines)
  const stations = useMetroStore((state) => state.stations)
  const visualToStations = useMetroStore((state) => state.visualToStations)

  const lineOptions = useLineOptions()

  const transferNodes = useMemo(
    () => buildTransferNodes(stations, lines, visualToStations),
    [stations, lines, visualToStations]
  )

  return { lineOptions, transferNodes, hasLines: lines.length > 0 }
}
