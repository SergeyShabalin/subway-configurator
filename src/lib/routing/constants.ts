/** Время пересадки внутри одного узла (станции на одном визуале). В данных его нет. */
export const DEFAULT_INTERCHANGE_MINUTES = 3

/** Сколько вариантов показываем, включая самый быстрый. */
export const MAX_ROUTE_ALTERNATIVES = 3

/** Сколько кратчайших путей перебираем, чтобы выбрать из них заметно разные. */
export const CANDIDATE_POOL_SIZE = 24

/** Минимальный запас по времени для альтернативы. */
export const MIN_EXTRA_MINUTES = 5

/** Доля от лучшего времени — верхняя граница для альтернативы. */
export const EXTRA_TIME_RATIO = 0.3

/** Если общих перегонов больше этой доли от меньшего маршрута — это один и тот же маршрут. */
export const MAX_SHARED_RATIO = 0.75

/** Максимум комбинаций при переборе альтернатив по отрезкам маршрута с промежуточными точками. */
export const MAX_VIA_COMBINATIONS = 64

/** Основание степени в handleWheel (`scale *= BASE ** (-deltaY / 100)`). */
export const WHEEL_BASE = 1.1
