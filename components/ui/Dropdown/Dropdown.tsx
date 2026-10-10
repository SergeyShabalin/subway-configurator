'use client'

import { useEffect, useId, useRef, useState } from 'react'
import styles from './Dropdown.module.css'
import { DropdownMenu } from './DropdownMenu'

export interface DropdownOption<T extends string> {
  value: T
  label: string
  color?: string
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
}: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<DropdownPosition>({ top: 0, left: 0, width: 0 })

  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)

  const triggerId = useId()
  const labelId = `${triggerId}-label`
  const menuId = `${triggerId}-menu`

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDropdown = () => {
    if (disabled) return

    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }

    setIsOpen((open) => !open)
  }

  const handleSelect = (optionValue: T) => {
    onChange(optionValue)
    setIsOpen(false)
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
    <>
      {label && (
        <label id={labelId} className={styles.label} htmlFor={triggerId}>
          {label}
        </label>
      )}
      <div className={styles.wrapper}>
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
              {selectedOption.color && (
                <span
                  className={styles.colorDot}
                  style={{ backgroundColor: selectedOption.color }}
                />
              )}
              {selectedOption.label}
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
            options={options}
            value={value}
            onSelect={handleSelect}
            emptyMessage={emptyMessage}
            position={position}
          />
        )}
      </div>
    </>
  )
}
