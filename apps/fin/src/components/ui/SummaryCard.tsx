import { Link } from 'react-router-dom'
import styles from './SummaryCard.module.css'
import { fmtBRL } from '@/utils/format'

interface SummaryCardProps {
  label: string
  value: number
  accent: 'green' | 'red' | 'amber' | 'blue'
  to?: string
}

export function SummaryCard({ label, value, accent, to }: SummaryCardProps) {
  const inner = (
    <>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{fmtBRL(value)}</span>
    </>
  )

  if (to) {
    return (
      <Link to={to} className={`${styles.card} ${styles[accent]} ${styles.clickable}`}>
        {inner}
      </Link>
    )
  }

  return (
    <div className={`${styles.card} ${styles[accent]}`}>
      {inner}
    </div>
  )
}
