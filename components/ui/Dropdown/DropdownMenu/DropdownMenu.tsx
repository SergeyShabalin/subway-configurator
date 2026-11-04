'use client'

import type { CSSProperties, Ref } from 'react'
import { createPortal } from 'react-dom'
import type { DropdownOption } from '../Dropdown'
import styles from './DropdownMenu.module.css'
import { OptionColors } from './OptionColors/OptionColors'

export interface DropdownMenuProps<T extends string> {
  id: string
  options: Array<DropdownOption<T>>
  value: T | ''
  onSelect: (value: T) => void
  emptyMessage?: string
  largeList?: boolean
  position: {
    top: number
    left: number
    width: number
  }
  menuRef?: Ref<HTMLUListElement>
}

const VIEWPORT_PADDING = 8
const MENU_MAX_HEIGHT_SMALL = 320
const MENU_MAX_HEIGHT_LARGE = 600

export const DropdownMenu = <T extends string>({
  id,
  options,
  value,
  onSelect,
  emptyMessage = '',
  position,
  menuRef,
  largeList = false,
}: DropdownMenuProps<T>) => {
  // Сколько места реально есть под меню до низа экрана
  const spaceBelow = window.innerHeight - position.top - VIEWPORT_PADDING
  const cap = largeList ? MENU_MAX_HEIGHT_LARGE : MENU_MAX_HEIGHT_SMALL
  const maxHeight = Math.max(80, Math.min(cap, spaceBelow))

  const positionStyle = {
    '--dropdown-top': `${position.top}px`,
    '--dropdown-left': `${position.left}px`,
    '--dropdown-width': `${position.width}px`,
    '--dropdown-max-height': `${maxHeight}px`,
  } as CSSProperties

  return createPortal(
    <ul
      ref={menuRef}
      id={id}
      className={`${styles.menu} ${largeList ? styles.largeList : ''}`}
      style={positionStyle}
      role="listbox"
    >
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
              <OptionColors colors={option.colors} color={option.color} />
              {option.label}
            </span>
          </li>
        ))
      )}
    </ul>,
    document.body
  )
}
