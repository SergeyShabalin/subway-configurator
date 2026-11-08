'use client'

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import styles from './Dropdown.module.css'
import { DropdownMenu } from './DropdownMenu/DropdownMenu'
import { useFilteredOptions } from './hooks/useFilteredOptions'
import { useListBoxNavigation } from './hooks/useListBoxNavigation'
import { defaultOptionSearcher } from './search/createOptionSearcher'
import type { OptionSearcher } from './search/types'
import { titleIfTruncated } from './utils/titleIfTruncated'

export interface DropdownOption<T extends string> {
  value: T
  label: string
  leading?: ReactNode
}

interface DropdownPosition {
  top: number
  left: number
  width: number
}

interface DropdownProps<T extends string> {
  value: T | ''
  options: Array<DropdownOption<T>>
  onChange: (value: T) => void
  label?: string
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  largeList?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  noResultsMessage?: string
  searcher?: OptionSearcher
}

export const Dropdown = <T extends string>({
  value,
  options,
  onChange,
  label,
  placeholder = '',
  emptyMessage = '',
  disabled = false,
  className,
  largeList = false,
  searchable = true,
  searchPlaceholder = 'Поиск...',
  noResultsMessage = 'Ничего не найдено',
  searcher = defaultOptionSearcher,
}: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [position, setPosition] = useState<DropdownPosition>({ top: 0, left: 0, width: 0 })

  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const triggerId = useId()
  const labelId = `${triggerId}-label`
  const menuId = `${triggerId}-menu`

  const selectedOption = options.find((opt) => opt.value === value)
  const filteredOptions = useFilteredOptions(options, searchable ? query : '', searcher)

  const closeDropdown = useCallback(() => {
    setIsOpen(false)
    setQuery('')
  }, [])

  const handleSelect = useCallback(
    (optionValue: T) => {
      onChange(optionValue)
      closeDropdown()
      triggerRef.current?.focus()
    },
    [onChange, closeDropdown]
  )

  const { activeIndex, setActiveIndex, onKeyDown } = useListBoxNavigation({
    itemCount: filteredOptions.length,
    resetKey: query,
    onSelectIndex: (index) => {
      const option = filteredOptions[index]
      if (option) handleSelect(option.value)
    },
    onClose: () => {
      closeDropdown()
      triggerRef.current?.focus()
    },
  })

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        closeDropdown()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [closeDropdown])

  const toggleDropdown = () => {
    if (disabled) return

    if (isOpen) {
      closeDropdown()
      return
    }

    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
    setIsOpen(true)
  }

  const triggerClassName = [
    styles.trigger,
    isOpen ? styles.open : '',
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.wrapper}>
      {label && (
        <label id={labelId} className={styles.label} htmlFor={triggerId}>
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className={triggerClassName}
        onClick={toggleDropdown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? labelId : undefined}
      >
        {selectedOption ? (
          <span className={styles.optionLine}>
            {selectedOption.leading}
            <span
              className={styles.optionLabel}
              onMouseEnter={(e) => titleIfTruncated(e, selectedOption.label)}
            >
              {selectedOption.label}
            </span>
          </span>
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
        <span className={styles.arrow}>▼</span>
      </button>

      {isOpen && (
        <DropdownMenu
          menuRef={menuRef}
          id={menuId}
          options={filteredOptions}
          value={value}
          onSelect={handleSelect}
          emptyMessage={query ? noResultsMessage : emptyMessage}
          position={position}
          largeList={largeList}
          searchable={searchable}
          query={query}
          searchPlaceholder={searchPlaceholder}
          onQueryChange={setQuery}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          onKeyDown={onKeyDown}
        />
      )}
    </div>
  )
}
