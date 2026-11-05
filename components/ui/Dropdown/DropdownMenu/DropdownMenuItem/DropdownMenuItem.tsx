'use client'

import { useEffect, useRef } from 'react'
import type { DropdownOption } from '../../Dropdown'
import styles from '../DropdownMenu.module.css'
import { OptionColors } from '../OptionColors/OptionColors'

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
        <OptionColors colors={option.colors} color={option.color} />
        {option.label}
      </span>
    </li>
  )
}
