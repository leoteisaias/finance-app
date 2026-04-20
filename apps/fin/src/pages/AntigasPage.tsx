import { useState, type FormEvent } from 'react'
import { useAntigas } from '@/hooks/useAntigas'
import { ItemRow } from '@/components/ui/ItemRow'
import { FormCard } from '@/components/ui/FormCard'
import type { NovaDividaAntiga } from '@/types/index'
import styles from './AntigasPage.module.css'

const FORM_INICIAL: NovaDividaAntiga = {
  nome: '',
  valor: 0,
  data_ref: null,
  observacao: null,
}

export function AntigasPage() {
  const { antigas, loading, error, adicionar, remover } = useAntigas()
  const [form, setForm] = useState<NovaDividaAntiga>(FORM_INICIAL)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      await adicionar(form)
      setForm(FORM_INICIAL)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao adicionar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className={styles.loading}>carregando...</p>
  if (error) return <p className={styles.error}>{error}</p>

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>dívidas antigas</h1>

      <FormCard title="registrar dívida antiga" onSubmit={(e) => { void handleSubmit(e) }} submitLabel={saving ? 'salvando...' : 'adicionar'}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>nome / credor</label>
          <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} required placeholder="ex: banco X" />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>valor estimado</label>
          <input type="number" min="0.01" step="0.01" value={form.valor || ''} onChange={e => setForm(p => ({ ...p, valor: parseFloat(e.target.value) || 0 }))} required />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>data de referência</label>
          <input type="date" value={form.data_ref ?? ''} onChange={e => setForm(p => ({ ...p, data_ref: e.target.value || null }))} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>observação</label>
          <input value={form.observacao ?? ''} onChange={e => setForm(p => ({ ...p, observacao: e.target.value || null }))} placeholder="ex: em aberto desde 2020" />
        </div>
        {formError && <p className={styles.error}>{formError}</p>}
      </FormCard>

      {antigas.length === 0 ? (
        <p className={styles.empty}>nenhuma dívida antiga registrada.</p>
      ) : (
        <div className={styles.list}>
          {antigas.map(d => (
            <div key={d.id} className={styles.item}>
              <ItemRow
                label={d.nome}
                value={d.valor}
                date={d.data_ref ?? undefined}
                category={d.observacao ?? undefined}
                accent="amber"
                onDelete={() => void remover(d.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
