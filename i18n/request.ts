import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

type Messages = typeof import('../messages/en.json')

const loadMessages = async (locale: string): Promise<Messages> => {
  const messagesModule = (await import(`../messages/${locale}.json`)) as {
    default: Messages
  }
  return messagesModule.default
}

// eslint-disable-next-line import/no-default-export
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    messages: await loadMessages(locale),
    onError(error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[next-intl]', error.message)
      }
    },
    getMessageFallback({ key, namespace }) {
      return namespace ? `${namespace}.${key}` : key
    },
  }
})
