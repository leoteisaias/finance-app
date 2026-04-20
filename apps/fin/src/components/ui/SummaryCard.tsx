import styles from './SummaryCard.module.css'
import { fmtBRL } from '@/utils/format'

interface SummaryCardProps {
  label: string
  value: number
  accent: 'green' | 'red' | 'amber' | 'blue'
}

export function SummaryCard({ label, value, accent }: SummaryCardProps) {
  return (
    <div className={`${styles.card} ${styles[accent]}`}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{fmtBRL(value)}</span>
    </div>
  )
}
