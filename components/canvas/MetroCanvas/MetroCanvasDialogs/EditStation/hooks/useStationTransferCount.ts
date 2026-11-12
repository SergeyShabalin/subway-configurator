import { stationsService } from '@/src/lib/services'
import { useEffect, useState } from 'react'

export const useStationTransferCount = (stationId: string | null): number => {
  const [transferCount, setTransferCount] = useState(1)

  useEffect(() => {
    if (!stationId) return
    let cancelled = false

    stationsService.countTransferStations(stationId).then((count) => {
      if (!cancelled) {
        setTransferCount(count)
      }
    })

    return () => {
      cancelled = true
    }
  }, [stationId])

  return transferCount
}
