export const DEFAULT_TENSION = 0.3
export const TENSION_MULTIPLIER = 3
export const CONTROL_POINT_DIVISOR = 6

/** Метро: одна сплошная линия */
export const SUBWAY_WIDTH = 5

/** Наземные поезда: две параллельные линии */
export const RAIL_LINE_WIDTH = 2.5
export const RAIL_GAP = 6

/** Увеличенная зона клика */
export const HIT_STROKE_WIDTH = 20

/**
 * Три станции считаются лежащими на одной прямой, если средняя отклоняется не больше чем на столько пикселей.
 * Допуск очень жёсткий: выровненные станции лежат на прямой с машинной точностью,
 * а расставленные вручную под него не попадают и рисуются как раньше.
 */
export const STRAIGHT_TOLERANCE = 0.0001
export const MIN_DISTINCT_DISTANCE = 1e-6
