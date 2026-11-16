'use client'

import { Button } from '@/components/ui'
import { useTranslations } from 'next-intl'
import styles from '../BranchesPanel.module.css'
import type { useBranchesPanel } from '../hooks/useBranchesPanel'

interface MoveTabProps {
  move: ReturnType<typeof useBranchesPanel>['move']
}

export const MoveTab = ({ move }: MoveTabProps) => {
  const t = useTranslations('BranchesPanel')

  return (
    <>
      <div className={styles.actions}>
        <Button
          title={move.isEnabled ? t('moveOff') : t('moveOn')}
          variant="outlineColored"
          color="primary"
          active={move.isEnabled}
          onClick={move.toggle}
          disabled={!move.hasLine}
        />
      </div>

      {!move.hasLine && <p className={styles.hint}>{t('moveSelectLine')}</p>}
      {move.hasLine && move.isBlocked && <p className={styles.message}>{t('moveBlocked')}</p>}
      {move.isActive && <p className={styles.success}>{t('moveActive')}</p>}
    </>
  )
}
