import type { StationAppearance, StationCircleProps } from '../../types'

const arraysEqual = <T>(a?: ReadonlyArray<T>, b?: ReadonlyArray<T>) =>
  a === b || (!!a && !!b && a.length === b.length && a.every((v, i) => v === b[i]))

const appearanceEqual = (a: StationAppearance, b: StationAppearance) =>
  a === b ||
  (a.isMultiLine === b.isMultiLine &&
    a.isTransferStation === b.isTransferStation &&
    a.color === b.color &&
    arraysEqual(a.colors, b.colors) &&
    arraysEqual(a.colorsActive, b.colorsActive))

/** Сравнивает `appearance` по содержимому, чтобы пересчёт не перерисовывал неизменившиеся станции */
export const areStationCirclePropsEqual = (prev: StationCircleProps, next: StationCircleProps) =>
  prev.visual === next.visual &&
  prev.stationId === next.stationId &&
  prev.isDimmed === next.isDimmed &&
  prev.handlers === next.handlers &&
  appearanceEqual(prev.appearance, next.appearance)
