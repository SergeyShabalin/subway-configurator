import type { MouseEvent } from 'react'

/** Ставит title с полным текстом, только если текст обрезан многоточием. */
export const titleIfTruncated = (e: MouseEvent<HTMLElement>, fullText: string) => {
  const el = e.currentTarget
  el.title = el.scrollWidth > el.clientWidth ? fullText : ''
}
