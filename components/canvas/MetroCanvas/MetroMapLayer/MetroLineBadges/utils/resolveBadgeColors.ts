export const resolveBadgeTextColor = (hex: string): string => {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex)

  if (!match) return '#ffffff'

  const color = Number.parseInt(match[1], 16)

  const luminance = 0.299 * (color >> 16) + 0.587 * ((color >> 8) & 255) + 0.114 * (color & 255)

  return luminance > 160 ? '#000000' : '#ffffff'
}
