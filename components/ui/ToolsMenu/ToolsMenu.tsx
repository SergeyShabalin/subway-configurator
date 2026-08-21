'use client'

import { DownloadJson } from '@/components/db/DownloadJson/DownloadJson'
import { UploadJson } from '@/components/db/UploadJson/UploadJson'
import { useState } from 'react'

export const ToolsMenu = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
      }}
    >
      {/* Кнопка меню */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: isOpen ? '#ef4444' : '#3b82f6',
          color: 'white',
          border: 'none',
          fontSize: 24,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'all 0.2s',
        }}
      >
        {isOpen ? '✕' : '⚙️'}
      </button>

      {/* Меню */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            right: 0,
            background: 'white',
            borderRadius: 8,
            padding: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            minWidth: 220,
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#6b7280', marginBottom: 4 }}>
              📤 Загрузка
            </div>
            <UploadJson />
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', margin: '8px 0' }} />

          <div>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#6b7280', marginBottom: 4 }}>
              📥 Выгрузка
            </div>
            <DownloadJson />
          </div>
        </div>
      )}
    </div>
  )
}
