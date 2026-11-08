import { Button } from '@/components/ui/Button/Button'
import { useTranslations } from 'next-intl'
import { CSSProperties, Fragment, useId, useState } from 'react'
import type { VerticalTimelineListProps } from './types'
import styles from './VerticalTimelineList.module.css'

export const VerticalTimelineList = ({
  items,
  color,
  variant = 'single',
}: VerticalTimelineListProps) => {
  const t = useTranslations('VerticalTimelineList')
  const [isExpanded, setIsExpanded] = useState(false)
  const listId = useId()

  if (items.length === 0) return null

  const isDouble = variant === 'double'
  const isExpandable = items.length > 2
  const hiddenCount = items.length - 2

  const lineStyle: CSSProperties = isDouble ? { borderColor: color } : { backgroundColor: color }

  const visibleItems = isExpanded || !isExpandable ? items : [items[0], items[items.length - 1]]

  return (
    <div className={styles.container}>
      <div
        className={`${styles.line} ${isDouble ? styles.lineDouble : ''} ${
          isExpanded ? styles.lineExpanded : ''
        }`}
        style={lineStyle}
      />
      <ul id={listId} className={styles.list}>
        {visibleItems.map((item, index) => (
          <Fragment key={item.id}>
            {isExpandable && !isExpanded && index === 1 && (
              <li className={styles.expandItem}>
                <Button
                  title={t('showMore', { count: hiddenCount })}
                  variant="ghost"
                  size="small"
                  color="primary"
                  className={styles.expandButton}
                  aria-expanded={false}
                  aria-controls={listId}
                  onClick={() => setIsExpanded(true)}
                />
              </li>
            )}

            <li className={styles.item}>
              <div className={styles.dot} style={{ borderColor: color }} />
              <span>{item.label}</span>
            </li>
          </Fragment>
        ))}

        {isExpandable && isExpanded && (
          <li className={styles.collapseItem}>
            <Button
              title={t('collapse')}
              variant="ghost"
              size="small"
              color="primary"
              className={styles.expandButton}
              aria-expanded={true}
              aria-controls={listId}
              onClick={() => setIsExpanded(false)}
            />
          </li>
        )}
      </ul>
    </div>
  )
}
