import type { TransferStyle } from '../constants'

export const getTransferStyle = (style?: string): TransferStyle => {
  if (style === 'dotted' || style === 'solid' || style === 'dashed') {
    return style
  }

  return 'dashed'
}
