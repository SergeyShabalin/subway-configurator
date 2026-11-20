export const handleDeleteLineError = (error: unknown, t: (key: string) => string) => {
  console.error('Error deleting line:', error)
  alert(t('errorDelete'))
}
