import styles from './ItemRow.module.css'
import { Badge } from './Badge'
import { fmtBRL, fmtData } from '@/utils/format'

interface ItemRowProps {
  label: string
  value: number
  date?: string
  category?: string
  accent?: 'green' | 'red' | 'amber' | 'blue'
  onDelete?: () => void
}

export function ItemRow({ label, value, date, category, accent = 'green', onDelete }: ItemRowProps) {
  return (
    <div className={styles.row}>
      <div className={styles.left}>
        <span className={styles.label}>{label}</span>
        <div className={styles.meta}>
          {date && <span className={styles.date}>{fmtData(date)}</span>}
          {category && <Badge text={category} />}
        </div>
      </div>
      <div className={styles.right}>
        <span className={`${styles.value} ${styles[accent]}`}>{fmtBRL(value)}</span>
        {onDelete && (
          <button className={styles.deleteBtn} onClick={onDelete} aria-label="Remover">
            ×
          </button>
        )}
      </div>
    </div>
  )
}
