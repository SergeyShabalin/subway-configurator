/**
 * Реальное положение точки position: fixed; top: 0; left: 0 в координатах getBoundingClientRect.
 * Обычно (0, 0), но в iOS «Домой» может отличаться из-за сдвига документа.
 */
export const getFixedOrigin = (): { top: number; left: number } => {
  const probe = document.createElement('div')
  probe.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none'
  document.body.appendChild(probe)
  const rect = probe.getBoundingClientRect()
  document.body.removeChild(probe)

  return { top: rect.top, left: rect.left }
}
