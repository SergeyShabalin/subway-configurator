import type { StationKind } from '@/types/metro'
import type { StationAppearance } from '../../types'

export const getStationKind = ({
  isMultiLine,
  isTransferStation,
}: StationAppearance): StationKind =>
  isMultiLine ? 'multiLine' : isTransferStation ? 'transfer' : 'regular'
