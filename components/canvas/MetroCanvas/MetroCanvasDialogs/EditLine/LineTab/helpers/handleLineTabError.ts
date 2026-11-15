export const handleLineTabError = (error: unknown, t: (key: string) => string) => {
  console.error('Error updating line:', error)
  alert(t('errorSave'))
}
