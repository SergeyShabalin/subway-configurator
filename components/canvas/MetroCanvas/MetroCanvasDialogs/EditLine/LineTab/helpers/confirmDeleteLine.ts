type Translate = (key: string, values?: { name: string; count: number }) => string

export const confirmDeleteLine = (t: Translate, name: string, stationCount: number): boolean =>
  window.confirm(t('confirmDelete', { name, count: stationCount }))
