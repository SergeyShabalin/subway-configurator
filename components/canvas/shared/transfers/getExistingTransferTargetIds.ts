interface TransferLike {
  from_visual_id?: string | null
  to_visual_id?: string | null
}

export const getExistingTransferTargetIds = (
  transfers: ReadonlyArray<TransferLike>,
  visualId: string
): Array<string> => {
  const ids: Array<string> = []

  for (const t of transfers) {
    if (t.from_visual_id === visualId && t.to_visual_id) ids.push(t.to_visual_id)
    else if (t.to_visual_id === visualId && t.from_visual_id) ids.push(t.from_visual_id)
  }

  return ids
}
