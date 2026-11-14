import { Button } from '@/components/ui/Button'
import type { SidebarToolbarProps } from '../../types'
import styles from './SidebarToolbar.module.css'

export function SidebarToolbar({ items, activeId, onItemClick }: SidebarToolbarProps) {
  return (
    <aside className={styles.toolbar}>
      <nav className={styles.navigation}>
        {items.map((item) => (
          <Button
            key={item.id}
            variant="soft"
            iconOnly
            className={styles.button}
            active={activeId === item.id}
            onClick={() => onItemClick(item.id)}
            aria-label={item.label}
          >
            {item.icon}
          </Button>
        ))}
      </nav>
    </aside>
  )
}
