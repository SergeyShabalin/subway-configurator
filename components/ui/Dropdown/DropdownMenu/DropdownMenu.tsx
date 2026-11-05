'use client'

import type { CSSProperties, KeyboardEvent, Ref } from 'react'
import { createPortal } from 'react-dom'
import type { DropdownOption } from '../Dropdown'
import styles from './DropdownMenu.module.css'
import { DropdownMenuItem } from './DropdownMenuItem/DropdownMenuItem'
import { DropdownSearch } from './DropdownSearch/DropdownSearch'

export interface DropdownMenuProps<T extends string> {
  id: string
  options: Array<DropdownOption<T>>
  value: T | ''
  onSelect: (value: T) => void
  emptyMessage?: string
  largeList?: boolean
  position: { top: number; left: number; width: number }
  menuRef?: Ref<HTMLDivElement>
  searchable?: boolean
  query?: string
  searchPlaceholder?: string
  onQueryChange?: (query: string) => void
  activeIndex?: number
  onActiveIndexChange?: (index: number) => void
  onKeyDown?: (e: KeyboardEvent) => void
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
  searchable = false,
  query = '',
  searchPlaceholder,
  onQueryChange,
  activeIndex = -1,
  onActiveIndexChange,
  onKeyDown,
}: DropdownMenuProps<T>) => {
  const spaceBelow = window.innerHeight - position.top - VIEWPORT_PADDING
  const cap = largeList ? MENU_MAX_HEIGHT_LARGE : MENU_MAX_HEIGHT_SMALL
  const maxHeight = Math.max(80, Math.min(cap, spaceBelow))

  const positionStyle = {
    '--dropdown-top': `${position.top}px`,
    '--dropdown-left': `${position.left}px`,
    '--dropdown-width': `${position.width}px`,
    '--dropdown-max-height': `${maxHeight}px`,
  } as CSSProperties

  const listId = `${id}-list`
  const optionId = (index: number) => `${id}-option-${index}`

  return createPortal(
    <div ref={menuRef} id={id} className={styles.menu} style={positionStyle}>
      {searchable && (
        <DropdownSearch
          value={query}
          placeholder={searchPlaceholder}
          listId={listId}
          activeOptionId={
            activeIndex >= 0 && options[activeIndex] ? optionId(activeIndex) : undefined
          }
          onChange={(q) => onQueryChange?.(q)}
          onKeyDown={(e) => onKeyDown?.(e)}
        />
      )}

      <ul id={listId} className={styles.list} role="listbox">
        {options.length === 0 ? (
          <li className={styles.empty}>{emptyMessage}</li>
        ) : (
          options.map((option, index) => (
            <DropdownMenuItem
              key={option.value}
              id={optionId(index)}
              option={option}
              isSelected={option.value === value}
              isActive={index === activeIndex}
              onSelect={() => onSelect(option.value)}
              onHover={() => onActiveIndexChange?.(index)}
            />
          ))
        )}
      </ul>
    </div>,
    document.body
  )
}
