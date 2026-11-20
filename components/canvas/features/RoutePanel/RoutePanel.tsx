'use client'

import { Button } from '@/components/ui'
import { CloseIcon } from '@/components/ui/Icons'
import { useTranslations } from 'next-intl'
import { RoutePointField } from './components/RoutePointField'
import { useRoutePanel } from './hooks/useRoutePanel'
import styles from './RoutePanel.module.css'
import { RouteResult } from './RouteResult/RouteResult'

export const RoutePanel = () => {
  const t = useTranslations('RoutePanel')

  const { hasStations, dropdownOptions, points, hasPoints, result, actions } = useRoutePanel()

  if (!hasStations) return null

  const { fromId, toId, viaIds } = points
  const { routes, activeIndex, status, selectRoute } = result

  return (
    <div className={styles.content}>
      <div className={styles.fields}>
        <RoutePointField
          label={t('from')}
          value={fromId}
          options={dropdownOptions}
          onChange={actions.setFrom}
        />

        {viaIds.map((viaId, index) => (
          <div key={index} className={styles.viaRow}>
            <RoutePointField
              label={t('via', { n: index + 1 })}
              value={viaId}
              options={dropdownOptions}
              onChange={(value) => actions.setVia(index, value)}
            />
            <Button
              variant="ghost"
              iconOnly
              className={styles.iconButton}
              onClick={() => actions.removeVia(index)}
              aria-label={t('removeVia')}
            >
              <CloseIcon />
            </Button>
          </div>
        ))}

        <RoutePointField
          label={t('to')}
          value={toId}
          options={dropdownOptions}
          onChange={actions.setTo}
        />
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" size="small" title={`+ ${t('addVia')}`} onClick={actions.addVia} />
        <Button
          variant="ghost"
          size="small"
          title={t('swap')}
          onClick={actions.swap}
          disabled={!hasPoints}
        />
        <Button
          variant="ghost"
          size="small"
          title={t('reset')}
          onClick={actions.reset}
          disabled={!hasPoints}
        />
      </div>

      {status === 'sameStation' && <p className={styles.message}>{t('sameStation')}</p>}
      {status === 'notFound' && <p className={styles.message}>{t('notFound')}</p>}
      {status === 'found' && (
        <div className={styles.resultWrapper}>
          <RouteResult routes={routes} activeIndex={activeIndex} onSelect={selectRoute} />
        </div>
      )}
    </div>
  )
}
