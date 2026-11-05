'use client'

import { useEffect, useRef, type KeyboardEvent } from 'react'
import styles from './DropdownSearch.module.css'

interface DropdownSearchProps {
  value: string
  placeholder?: string
  listId: string
  activeOptionId?: string
  onChange: (value: string) => void
  onKeyDown: (e: KeyboardEvent) => void
}

export const DropdownSearch = ({
  value,
  placeholder,
  listId,
  activeOptionId,
  onChange,
  onKeyDown,
}: DropdownSearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <input
      ref={inputRef}
      type="text"
      className={styles.input}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      role="combobox"
      aria-expanded
      aria-controls={listId}
      aria-activedescendant={activeOptionId}
      aria-autocomplete="list"
      autoComplete="off"
      spellCheck={false}
    />
  )
}
