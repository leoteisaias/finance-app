import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = total > 0 ? Math.min((current / total) * 100, 100) : 0

  return (
    <div className={styles.wrapper}>
      <div className={styles.track} role="progressbar" aria-valuenow={current} aria-valuemax={total}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
      <span className={styles.label}>{current}/{total} parcelas</span>
    </div>
  )
}
