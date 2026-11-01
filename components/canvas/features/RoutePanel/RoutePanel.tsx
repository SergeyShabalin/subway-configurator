'use client'

import { useRoutes } from '@/components/canvas/MetroCanvas/hooks/useRoute'
import { Button } from '@/components/ui'
import { Dropdown } from '@/components/ui/Dropdown'
import { useMetroStore } from '@/store'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import styles from './RoutePanel.module.css'
import { RouteResult } from './RouteResult/RouteResult'
import { useRouteOptions } from './hooks/useRouteOptions'
import { useRouteSync } from './hooks/useRouteSync'

type RouteStatus = 'idle' | 'sameStation' | 'notFound' | 'found'

/**
 * Панель построения маршрута между двумя станциями с возможностью добавить промежуточные точки.
 *
 * Компонент отвечает только за UI-логику (открытие/закрытие панели, рендер полей и результата).
 * Вся работа с данными вынесена в хуки:
 * - `useRouteOptions` — собирает опции для `Dropdown`.
 * - `useRouteSync` — сбрасывает неактуальные выбранные станции.
 * - `useRoutes` — вычисляет маршрут (через промежуточные точки, если они есть).
 *
 * Если на схеме нет ни одной станции, панель не рендерится.
 */
export const RoutePanel = () => {
  const t = useTranslations('RoutePanel')

  const fromId = useMetroStore((state) => state.routeFromId)
  const toId = useMetroStore((state) => state.routeToId)
  const viaIds = useMetroStore((state) => state.routeViaIds)
  const setRoutePoints = useMetroStore((state) => state.setRoutePoints)
  const setRouteVia = useMetroStore((state) => state.setRouteVia)
  const addRouteVia = useMetroStore((state) => state.addRouteVia)
  const removeRouteVia = useMetroStore((state) => state.removeRouteVia)

  const { routes, activeIndex, route, selectRoute } = useRoutes()
  const [isOpen, setIsOpen] = useState(false)

  const { options, dropdownOptions } = useRouteOptions()
  useRouteSync(options)

  const hasVia = viaIds.length > 0
  const allViaFilled = viaIds.every(Boolean)
  const sameAdjacent = [fromId, ...viaIds, toId].some(
    (id, i, arr) => i > 0 && Boolean(id) && id === arr[i - 1]
  )

  const status: RouteStatus =
    !fromId || !toId
      ? 'idle'
      : !allViaFilled
        ? 'idle'
        : sameAdjacent
          ? 'sameStation'
          : route
            ? 'found'
            : 'notFound'

  if (options.length === 0) return null

  if (!isOpen) {
    return (
      <div className={styles.root}>
        <Button variant="ghost" className={styles.toggle} onClick={() => setIsOpen(true)}>
          {t('open')}
          {route && (
            <span className={styles.badge}>{t('total', { minutes: route.totalMinutes })}</span>
          )}
        </Button>
      </div>
    )
  }

  const hasPoints = Boolean(fromId || toId || hasVia)

  const handleSwap = () => {
    setRoutePoints(toId, fromId, [...viaIds].reverse())
  }

  const handleReset = () => {
    setRoutePoints('', '', [])
  }

  return (
    <div className={styles.root}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <h2 className={styles.title}>{t('title')}</h2>
          <Button variant="ghost" className={styles.link} onClick={() => setIsOpen(false)}>
            {t('close')}
          </Button>
        </header>

        <div className={styles.fields}>
          <Dropdown
            label={t('from')}
            value={fromId}
            options={dropdownOptions}
            placeholder={t('placeholder')}
            emptyMessage={t('placeholder')}
            onChange={(value) => setRoutePoints(value, toId, viaIds)}
            largeList
          />

          {viaIds.map((viaId, index) => (
            <div key={index} className={styles.viaRow}>
              <Dropdown
                label={t('via', { n: index + 1 })}
                value={viaId}
                options={dropdownOptions}
                placeholder={t('placeholder')}
                emptyMessage={t('placeholder')}
                onChange={(value) => setRouteVia(index, value)}
                largeList
              />
              <Button
                variant="ghost"
                size="medium"
                className={styles.iconButton}
                onClick={() => removeRouteVia(index)}
                aria-label={t('removeVia')}
                title="✕"
              />
            </div>
          ))}

          <Dropdown
            label={t('to')}
            value={toId}
            options={dropdownOptions}
            placeholder={t('placeholder')}
            emptyMessage={t('placeholder')}
            onChange={(value) => setRoutePoints(fromId, value, viaIds)}
            largeList
          />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.link} onClick={addRouteVia}>
            + {t('addVia')}
          </button>
          <button type="button" className={styles.link} onClick={handleSwap} disabled={!hasPoints}>
            {t('swap')}
          </button>
          <button type="button" className={styles.link} onClick={handleReset} disabled={!hasPoints}>
            {t('reset')}
          </button>
        </div>

        {status === 'sameStation' && <p className={styles.message}>{t('sameStation')}</p>}
        {status === 'notFound' && <p className={styles.message}>{t('notFound')}</p>}
        {status === 'found' && (
          <RouteResult routes={routes} activeIndex={activeIndex} onSelect={selectRoute} />
        )}
      </section>
    </div>
  )
}
