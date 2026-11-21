'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export const DebugViewport = () => {
  const probe = useRef<HTMLDivElement>(null)
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const update = () => {
      const p = probe.current
      const cs = p ? getComputedStyle(p) : null

      const edge = document.createElement('div')
      edge.style.cssText = 'position:fixed;left:0;bottom:0;width:1px;height:1px;visibility:hidden'
      document.body.appendChild(edge)
      const edgeBottom = Math.round(edge.getBoundingClientRect().bottom)
      document.body.removeChild(edge)

      setText(
        [
          `inner: ${window.innerWidth}x${window.innerHeight}`,
          `client: ${document.documentElement.clientHeight}`,
          `screen: ${screen.width}x${screen.height}`,
          `visual: ${Math.round(window.visualViewport?.height ?? 0)}`,
          `visual top: ${Math.round(window.visualViewport?.offsetTop ?? 0)}`,
          `fixed bottom edge: ${edgeBottom}`,
          `safe top: ${cs?.paddingTop}`,
          `safe bottom: ${cs?.paddingBottom}`,
          `standalone: ${String((navigator as Navigator & { standalone?: boolean }).standalone)}`,
          `ua: ${navigator.userAgent}`,
        ].join('\n')
      )
    }

    update()
    window.addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)

    return () => {
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Запасной вариант, если Clipboard API недоступен
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
          wordBreak: 'break-all',
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
