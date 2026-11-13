import type { StationAppearance } from '../../types'
import { BASE_RADIUS, MULTI_LINE_BASE_RADIUS, TRANSFER_STATION_RADIUS } from '../constants'

export const getStationRadius = ({ isMultiLine, isTransferStation }: StationAppearance): number =>
  isMultiLine ? MULTI_LINE_BASE_RADIUS : isTransferStation ? TRANSFER_STATION_RADIUS : BASE_RADIUS
