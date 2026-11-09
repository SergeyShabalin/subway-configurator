import type { VisualTransfer } from '@/types/metro'

export const FALLBACK_COLOR = '#94a3b8'

export type TransferStyle = NonNullable<VisualTransfer['style']>

export const DASH_PATTERN: Record<TransferStyle, Array<number> | undefined> = {
  dashed: [6, 6],
  dotted: [1.5, 5],
  solid: undefined,
}
