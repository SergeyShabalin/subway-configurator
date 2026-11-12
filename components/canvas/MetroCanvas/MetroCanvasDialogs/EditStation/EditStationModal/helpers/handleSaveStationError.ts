export const handleSaveStationError = (error: unknown, t: (key: string) => string) => {
  console.error('Error updating station name:', error)
  alert(t('errorSave'))
}
