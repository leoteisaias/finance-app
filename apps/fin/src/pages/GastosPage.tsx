import { useState, type FormEvent } from 'react'
import { useGastos } from '@/hooks/useGastos'
import { ItemRow } from '@/components/ui/ItemRow'
import { FormCard } from '@/components/ui/FormCard'
import { mesAtual, fmtMes, fmtBRL } from '@/utils/format'
import type { NovoGasto, CategoriaGasto } from '@/types/index'
import styles from './GastosPage.module.css'

const CATEGORIAS: CategoriaGasto[] = ['alimentação', 'transporte', 'outros']

const hoje = new Date().toISOString().slice(0, 10)

const FORM_INICIAL: NovoGasto = {
  descricao: '',
  valor: 0,
  data: hoje,
  categoria: 'outros',
}

export function GastosPage() {
  const mes = mesAtual()
  const { gastos, loading, error, adicionar, remover } = useGastos(mes)
  const [form, setForm] = useState<NovoGasto>(FORM_INICIAL)
  const [valorStr, setValorStr] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const total = gastos.reduce((acc, g) => acc + g.valor, 0)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      await adicionar(form)
      setForm({ ...FORM_INICIAL, data: new Date().toISOString().slice(0, 10) })
      setValorStr('')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : (err as { message?: string }).message ?? 'Erro ao adicionar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className={styles.loading}>carregando...</p>
  if (error) return <p className={styles.error}>{error}</p>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>gastos</h1>
        <div className={styles.totalBox}>
          <span className={styles.totalLabel}>{fmtMes(mes)}</span>
          <span className={styles.totalValue}>{fmtBRL(total)}</span>
        </div>
      </div>

      <FormCard title="novo gasto" onSubmit={(e) => { void handleSubmit(e) }} submitLabel={saving ? 'salvando...' : 'adicionar'}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>descrição</label>
          <input value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} required placeholder="ex: almoço" />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>valor</label>
          <input
            type="text"
            inputMode="decimal"
            value={valorStr}
            required
            onChange={e => {
              const str = e.target.value
              setValorStr(str)
              const num = parseFloat(str.replace(',', '.'))
              setForm(p => ({ ...p, valor: isNaN(num) ? 0 : num }))
            }}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>data</label>
          <input type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} required />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>categoria</label>
          <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value as CategoriaGasto }))}>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {formError && <p className={styles.error}>{formError}</p>}
      </FormCard>

      {gastos.length === 0 ? (
        <p className={styles.empty}>nenhum gasto registrado este mês.</p>
      ) : (
        <div className={styles.list}>
          {gastos.map(g => (
            <div key={g.id} className={styles.item}>
              <ItemRow
                label={g.descricao}
                value={g.valor}
                date={g.data}
                category={g.categoria}
                accent="blue"
                onDelete={() => void remover(g.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
