import type { ReactNode, FormEvent } from 'react'
import styles from './FormCard.module.css'

interface FormCardProps {
  title: string
  children: ReactNode
  onSubmit: (e: FormEvent) => void
  submitLabel?: string
}

export function FormCard({ title, children, onSubmit, submitLabel = 'adicionar' }: FormCardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <form className={styles.form} onSubmit={onSubmit}>
        {children}
        <button type="submit" className={styles.btn}>{submitLabel}</button>
      </form>
    </div>
  )
}
