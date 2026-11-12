export const handleDeleteStationError = (error: unknown, t: (key: string) => string) => {
  console.error('Error deleting station:', error)
  alert(t('errorDelete'))
}
