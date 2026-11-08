'use client'

import { useEffect, useRef } from 'react'
import type { DropdownOption } from '../../Dropdown'
import { titleIfTruncated } from '../../utils/titleIfTruncated'
import styles from '../DropdownMenu.module.css'

interface DropdownMenuItemProps {
  id: string
  option: DropdownOption<string>
  isSelected: boolean
  isActive: boolean
  onSelect: () => void
  onHover: () => void
}

export const DropdownMenuItem = ({
  id,
  option,
  isSelected,
  isActive,
  onSelect,
  onHover,
}: DropdownMenuItemProps) => {
  const ref = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (isActive) ref.current?.scrollIntoView({ block: 'nearest' })
  }, [isActive])

  return (
    <li
      ref={ref}
      id={id}
      className={`${styles.item} ${isSelected || isActive ? styles.itemActive : ''}`}
      onClick={onSelect}
      onMouseEnter={onHover}
      role="option"
      aria-selected={isSelected}
    >
      <span className={styles.optionLine}>
        {option.leading}
        <span
          className={styles.optionLabel}
          onMouseEnter={(e) => titleIfTruncated(e, option.label)}
        >
          {option.label}
        </span>
      </span>
    </li>
  )
}
