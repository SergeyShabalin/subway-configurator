'use client'

import { useEffect, useRef, useState } from 'react'

export const DebugViewport = () => {
  const probe = useRef<HTMLDivElement>(null)
  const [text, setText] = useState('')

  useEffect(() => {
    const update = () => {
      const p = probe.current
      const cs = p ? getComputedStyle(p) : null
      setText(
        [
          `inner: ${window.innerWidth}x${window.innerHeight}`,
          `screen: ${screen.width}x${screen.height}`,
          `visual: ${Math.round(window.visualViewport?.height ?? 0)}`,
          `safe top: ${cs?.paddingTop}`,
          `safe bottom: ${cs?.paddingBottom}`,
          `standalone: ${String((navigator as Navigator & { standalone?: boolean }).standalone)}`,
        ].join(' | ')
      )
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <>
      <div
        ref={probe}
        style={{
          position: 'fixed',
          visibility: 'hidden',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 80,
          left: 10,
          right: 10,
          zIndex: 9999,
          padding: 8,
          background: '#000',
          color: '#0f0',
          fontSize: 11,
          wordBreak: 'break-all',
        }}
      >
        {text}
      </div>
    </>
  )
}
