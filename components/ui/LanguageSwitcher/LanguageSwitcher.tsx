'use client'

import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import styles from './LanguageSwitcher.module.css'

const LOCALE_LABELS: Record<string, string> = {
  ru: 'RU',
  en: 'EN',
}

export const LanguageSwitcher = () => {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (nextLocale: string) => {
    if (nextLocale === locale) return
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <div className={styles.wrapper} role="group" aria-label="Language switcher">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          className={`${styles.button} ${loc === locale ? styles.active : ''}`}
          onClick={() => switchLocale(loc)}
          aria-pressed={loc === locale}
        >
          {LOCALE_LABELS[loc] ?? loc.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
