// Станции без пересадок и не multi-line
export const BASE_RADIUS = 5

// Разноимённые станции, участвующие в пересадках (пунктир между ними)
export const TRANSFER_STATION_RADIUS = 7

// Одноимённые multi-line (несколько линий на одном визуале)
export const MULTI_LINE_BASE_RADIUS = 12

// Шаг между кольцами разных линий у multi-line станции
export const RING_STEP = 2.5

// Толщина обводки станции и колец
export const RING_WIDTH = 2.5

// Минимальный радиус внутреннего кольца (меньше — не рисуем)
export const MIN_RING_RADIUS = 3

// Порог смещения, ниже которого drag считается кликом
export const DRAG_THRESHOLD = 2

// Размытие тени при hover
export const HOVER_SHADOW_BLUR = 4
