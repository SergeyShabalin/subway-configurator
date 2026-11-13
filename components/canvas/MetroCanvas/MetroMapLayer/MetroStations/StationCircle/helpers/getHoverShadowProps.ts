import { HOVER_SHADOW_BLUR } from '../constants'

export const getHoverShadowProps = (isActive: boolean, hoverColor: string) => ({
  shadowColor: isActive ? hoverColor : undefined,
  shadowBlur: isActive ? HOVER_SHADOW_BLUR : 0,
  shadowOpacity: isActive ? 1 : 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
})
