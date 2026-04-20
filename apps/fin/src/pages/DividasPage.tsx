import { useState, type FormEvent } from 'react'
import { useDividas } from '@/hooks/useDividas'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { FormCard } from '@/components/ui/FormCard'
import { fmtBRL } from '@/utils/format'
import type { NovaDivida, CategoriaDivida } from '@/types/index'
import styles from './DividasPage.module.css'

const CATEGORIAS: CategoriaDivida[] = ['cartão de crédito', 'financiamento', 'pessoal', 'outro']

const FORM_INICIAL: NovaDivida = {
  nome: '',
  valor_total: 0,
  valor_parcela: 0,
  total_parcelas: 1,
  parcelas_pagas: 0,
  mes_inicio: new Date().toISOString().slice(0, 7) + '-01',
  categoria: 'outro',
}

export function DividasPage() {
  const { dividas, loading, error, adicionar, atualizarParcela, remover } = useDividas()
  const [form, setForm] = useState<NovaDivida>(FORM_INICIAL)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const set = (field: keyof NovaDivida, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }))

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
      <h1 className={styles.heading}>dívidas ativas</h1>

      <FormCard title="nova dívida" onSubmit={(e) => { void handleSubmit(e) }} submitLabel={saving ? 'salvando...' : 'adicionar'}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>nome</label>
          <input value={form.nome} onChange={e => set('nome', e.target.value)} required placeholder="ex: notebook" />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>valor total</label>
          <input type="number" min="0.01" step="0.01" value={form.valor_total || ''} onChange={e => set('valor_total', parseFloat(e.target.value) || 0)} required />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>valor parcela</label>
          <input type="number" min="0.01" step="0.01" value={form.valor_parcela || ''} onChange={e => set('valor_parcela', parseFloat(e.target.value) || 0)} required />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>total parcelas</label>
          <input type="number" min="1" step="1" value={form.total_parcelas} onChange={e => set('total_parcelas', parseInt(e.target.value) || 1)} required />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>mês início</label>
          <input type="month" value={form.mes_inicio.slice(0, 7)} onChange={e => set('mes_inicio', e.target.value + '-01')} required />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>categoria</label>
          <select value={form.categoria} onChange={e => set('categoria', e.target.value as CategoriaDivida)}>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {formError && <p className={styles.error}>{formError}</p>}
      </FormCard>

      {dividas.length === 0 ? (
        <p className={styles.empty}>nenhuma dívida ativa. boa!</p>
      ) : (
        <div className={styles.list}>
          {dividas.map(d => {
            const concluida = d.parcelas_pagas >= d.total_parcelas
            return (
              <div key={d.id} className={`${styles.item} ${concluida ? styles.concluida : ''}`}>
                <div className={styles.itemHeader}>
                  <div className={styles.itemLeft}>
                    <span className={styles.nome}>{d.nome}</span>
                    <Badge text={d.categoria} />
                  </div>
                  <div className={styles.itemRight}>
                    <span className={styles.valor}>{fmtBRL(d.valor_total)}</span>
                    <span className={styles.parcela}>{fmtBRL(d.valor_parcela)}/mês</span>
                  </div>
                </div>
                <ProgressBar current={d.parcelas_pagas} total={d.total_parcelas} />
                <div className={styles.actions}>
                  <button
                    className={styles.btnParcela}
                    onClick={() => void atualizarParcela(d.id, d.parcelas_pagas + 1)}
                    disabled={concluida}
                  >
                    + marcar parcela
                  </button>
                  {d.parcelas_pagas > 0 && (
                    <button
                      className={styles.btnUndo}
                      onClick={() => void atualizarParcela(d.id, d.parcelas_pagas - 1)}
                    >
                      desfazer
                    </button>
                  )}
                  <button className={styles.btnRemover} onClick={() => void remover(d.id)}>
                    remover
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
