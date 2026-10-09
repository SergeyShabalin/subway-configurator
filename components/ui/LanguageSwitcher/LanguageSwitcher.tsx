'use client'

import { Button } from '@/components/ui/Button'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { useCallback } from 'react'
import styles from './LanguageSwitcher.module.css'

const LOCALE_LABELS: Record<string, string> = {
  ru: 'RU',
  en: 'EN',
  es: 'ES',
}

export const LanguageSwitcher = () => {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = useCallback(
    (nextLocale: string) => {
      if (nextLocale === locale) return
      router.replace(pathname, { locale: nextLocale })
    },
    [locale, router, pathname]
  )

  return (
    <div className={styles.wrapper} role="group" aria-label="Language switcher">
      {routing.locales.map((loc) => {
        const isActive = loc === locale

        return (
          <Button
            key={loc}
            variant={isActive ? 'outlineColored' : 'ghost'}
            color="primary"
            size="small"
            data-locale={loc}
            onClick={(e) => switchLocale(e.currentTarget.dataset.locale ?? loc)}
            aria-pressed={isActive}
          >
            {LOCALE_LABELS[loc] ?? loc.toUpperCase()}
          </Button>
        )
      })}
    </div>
  )
}
