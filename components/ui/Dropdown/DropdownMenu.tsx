'use client'

import type { CSSProperties, Ref } from 'react'
import { createPortal } from 'react-dom'
import type { DropdownOption } from './Dropdown'
import styles from './DropdownMenu.module.css'

export interface DropdownMenuProps<T extends string> {
  id: string
  options: Array<DropdownOption<T>>
  value: T | ''
  onSelect: (value: T) => void
  emptyMessage?: string
  position: {
    top: number
    left: number
    width: number
  }
  menuRef?: Ref<HTMLUListElement>
}

export const DropdownMenu = <T extends string>({
  id,
  options,
  value,
  onSelect,
  emptyMessage = '',
  position,
  menuRef,
}: DropdownMenuProps<T>) => {
  const positionStyle = {
    '--dropdown-top': `${position.top}px`,
    '--dropdown-left': `${position.left}px`,
    '--dropdown-width': `${position.width}px`,
  } as CSSProperties

  return createPortal(
    <ul ref={menuRef} id={id} className={styles.menu} style={positionStyle} role="listbox">
      {options.length === 0 ? (
        <li className={styles.empty}>{emptyMessage}</li>
      ) : (
        options.map((option) => (
          <li
            key={option.value}
            className={`${styles.item} ${option.value === value ? styles.itemActive : ''}`}
            onClick={() => onSelect(option.value)}
            role="option"
            aria-selected={option.value === value}
          >
            <span className={styles.optionLine}>
              {option.color && (
                <span className={styles.colorDot} style={{ backgroundColor: option.color }} />
              )}
              {option.label}
            </span>
          </li>
        ))
      )}
    </ul>,
    document.body
  )
}
