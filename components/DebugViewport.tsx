'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const UNITS = ['100vh', '100dvh', '100lvh', '100svh'] as const

const measureUnit = (value: string): number => {
  const el = document.createElement('div')
  el.style.cssText = `position:fixed;left:0;top:0;width:1px;height:${value};visibility:hidden`
  document.body.appendChild(el)
  const height = Math.round(el.getBoundingClientRect().height)
  document.body.removeChild(el)
  return height
}

export const DebugViewport = () => {
  const probe = useRef<HTMLDivElement>(null)
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const update = () => {
      const cs = probe.current ? getComputedStyle(probe.current) : null
      const toolbar = document.querySelector('aside')
      const rect = toolbar?.getBoundingClientRect()
      const gapVar = document.documentElement.style.getPropertyValue('--standalone-bottom-gap')

      setText(
        [
          `inner: ${window.innerWidth}x${window.innerHeight}`,
          `screen: ${screen.width}x${screen.height}`,
          `visual: ${Math.round(window.visualViewport?.height ?? 0)}`,
          ...UNITS.map((unit) => `${unit}: ${measureUnit(unit)}`),
          `safe top: ${cs?.paddingTop}`,
          `safe bottom: ${cs?.paddingBottom}`,
          `gap var: "${gapVar}"`,
          `toolbar top: ${Math.round(rect?.top ?? -1)}`,
          `toolbar bottom: ${Math.round(rect?.bottom ?? -1)}`,
          `toolbar height: ${Math.round(rect?.height ?? -1)}`,
          `standalone: ${String((navigator as Navigator & { standalone?: boolean }).standalone)}`,
        ].join('\n')
      )
    }

    update()
    const timer = setTimeout(update, 500)
    window.addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const area = document.createElement('textarea')
      area.value = text
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      document.body.removeChild(area)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [text])

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
          top: 120,
          left: 10,
          right: 10,
          zIndex: 9999,
          padding: 8,
          background: '#000',
          color: '#0f0',
          fontSize: 12,
          whiteSpace: 'pre-wrap',
        }}
      >
        {text}
        <button
          type="button"
          onClick={handleCopy}
          style={{
            display: 'block',
            marginTop: 8,
            padding: '8px 14px',
            border: '1px solid #0f0',
            borderRadius: 6,
            background: 'transparent',
            color: '#0f0',
            fontSize: 14,
          }}
        >
          {copied ? 'Скопировано ✓' : 'Копировать'}
        </button>
      </div>
    </>
  )
}
