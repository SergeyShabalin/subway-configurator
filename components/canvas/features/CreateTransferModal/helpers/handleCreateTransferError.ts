export const handleCreateTransferError = (error: unknown, t: (key: string) => string) => {
  console.error('Error creating transfer:', error)

  if (error instanceof Error && error.message.includes('ALREADY_EXISTS')) {
    alert(t('errorAlreadyExists'))
  } else if (error instanceof Error && error.message.includes('SAME_VISUAL')) {
    alert(t('errorSameVisual'))
  } else {
    alert(t('errorCreate'))
  }
}
