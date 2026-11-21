import { useMemo } from 'react'
import { MIN_TOUCH_RADIUS_PX } from '../constants'
import { createTouchHitFunc } from '../helpers/touchHitFunc'
import { useIsCoarsePointer } from './useIsCoarsePointer'

export const useStationHitArea = () => {
  const isCoarse = useIsCoarsePointer()

  return useMemo(() => (isCoarse ? createTouchHitFunc(MIN_TOUCH_RADIUS_PX) : undefined), [isCoarse])
}
