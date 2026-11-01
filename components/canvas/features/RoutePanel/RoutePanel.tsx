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
 * Панель построения маршрута между двумя станциями.
 *
 * Компонент отвечает только за UI-логику (открытие/закрытие панели, рендер полей и результата).
 * Вся работа с данными вынесена в хуки:
 * - `useRouteOptions` — собирает опции для `Dropdown`.
 * - `useRouteSync` — сбрасывает неактуальные выбранные станции.
 * - `useRoutes` — вычисляет самый быстрый маршрут и похожие варианты.
 *
 * Если на схеме нет ни одной станции, панель не рендерится.
 */
export const RoutePanel = () => {
  const t = useTranslations('RoutePanel')

  const fromId = useMetroStore((state) => state.routeFromId)
  const toId = useMetroStore((state) => state.routeToId)
  const setRoutePoints = useMetroStore((state) => state.setRoutePoints)

  const { routes, activeIndex, route, selectRoute } = useRoutes()
  const [isOpen, setIsOpen] = useState(false)

  const { options, dropdownOptions } = useRouteOptions()
  useRouteSync(options)

  const status: RouteStatus =
    !fromId || !toId ? 'idle' : fromId === toId ? 'sameStation' : route ? 'found' : 'notFound'

  if (options.length === 0) return null

  if (!isOpen) {
    return (
      <div className={styles.root}>
        <button type="button" className={styles.toggle} onClick={() => setIsOpen(true)}>
          {t('open')}
          {route && (
            <span className={styles.badge}>{t('total', { minutes: route.totalMinutes })}</span>
          )}
        </button>
      </div>
    )
  }

  const hasPoints = Boolean(fromId || toId)

  return (
    <div className={styles.root}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <h2 className={styles.title}>{t('title')}</h2>
          <button type="button" className={styles.link} onClick={() => setIsOpen(false)}>
            {t('close')}
          </button>
        </header>

        <div className={styles.fields}>
          <Dropdown
            label={t('from')}
            value={fromId}
            options={dropdownOptions}
            placeholder={t('placeholder')}
            emptyMessage={t('placeholder')}
            onChange={(value) => setRoutePoints(value, toId)}
            largeList
          />
          <Dropdown
            label={t('to')}
            value={toId}
            options={dropdownOptions}
            placeholder={t('placeholder')}
            emptyMessage={t('placeholder')}
            onChange={(value) => setRoutePoints(fromId, value)}
            largeList
          />
        </div>

        <div className={styles.actions}>
          <Button
            variant="ghost"
            className={styles.link}
            onClick={() => setRoutePoints(toId, fromId)}
            disabled={!hasPoints}
          >
            {t('swap')}
          </Button>
          <Button
            variant="ghost"
            className={styles.link}
            onClick={() => setRoutePoints('', '')}
            disabled={!hasPoints}
          >
            {t('reset')}
          </Button>
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
