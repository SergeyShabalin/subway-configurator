type Translate = (key: string, values?: { name: string; count: number }) => string

export const confirmDeleteStation = (
  t: Translate,
  name: string,
  transferCount: number
): boolean => {
  const confirmKey = transferCount > 1 ? 'confirmDeleteTransfer' : 'confirmDelete'
  return window.confirm(t(confirmKey, { name, count: transferCount }))
}
