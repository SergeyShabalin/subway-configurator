import type { LineType } from '@/types/metro'
import type { LineBadgeShape } from './LineBadgeIcon'

/** Единое правило: метро это круг, наземные поезда это параллелограмм. */
export const lineBadgeShape = (type?: LineType): LineBadgeShape =>
  type === 'commuter_rail' ? 'parallelogram' : 'circle'
