import type { StationAppearance } from '../../types'
import {
  BASE_STROKE_WIDTH,
  MULTI_LINE_STROKE_WIDTH,
  TRANSFER_STATION_STROKE_WIDTH,
} from '../constants'

export const getStationStrokeWidth = ({
  isMultiLine,
  isTransferStation,
}: StationAppearance): number =>
  isMultiLine
    ? MULTI_LINE_STROKE_WIDTH
    : isTransferStation
      ? TRANSFER_STATION_STROKE_WIDTH
      : BASE_STROKE_WIDTH
