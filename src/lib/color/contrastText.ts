/** Чёрный или белый текст в зависимости от яркости фона. */
export const contrastText = (hex: string): string => {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!match) return '#ffffff'

  const n = parseInt(match[1], 16)
  const luminance = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)
  return luminance > 160 ? '#000000' : '#ffffff'
}
