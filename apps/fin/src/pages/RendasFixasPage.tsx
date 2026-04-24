import { useState, type FormEvent } from 'react'
import { useRendasFixas } from '@/hooks/useRendasFixas'
import { FormCard } from '@/components/ui/FormCard'
import { fmtBRL } from '@/utils/format'
import type { NovaRendaFixa, CategoriaRendaFixa, RendaFixa } from '@/types/index'
import styles from './RendasFixasPage.module.css'

const CATEGORIAS: CategoriaRendaFixa[] = ['salário', 'aluguel', 'pensão', 'outro']

const FORM_INICIAL: NovaRendaFixa = {
  descricao: '',
  valor: 0,
  categoria: 'salário',
}

function rendaParaForm(r: RendaFixa): NovaRendaFixa {
  return { descricao: r.descricao, valor: r.valor, categoria: r.categoria }
}

export function RendasFixasPage() {
  const { rendasFixas, loading, error, adicionar, atualizar, remover } = useRendasFixas()
  const [form, setForm] = useState<NovaRendaFixa>(FORM_INICIAL)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [valorStr, setValorStr] = useState('')
  const [editValorStr, setEditValorStr] = useState('')

  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<NovaRendaFixa>(FORM_INICIAL)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const total = rendasFixas.reduce((acc, r) => acc + r.valor, 0)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      await adicionar(form)
      setForm(FORM_INICIAL)
      setValorStr('')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : (err as { message?: string }).message ?? 'Erro ao adicionar')
    } finally {
      setSaving(false)
    }
  }

  const abrirEdicao = (r: RendaFixa) => {
    setEditandoId(r.id)
    setEditForm(rendaParaForm(r))
    setEditValorStr(String(r.valor))
    setEditError(null)
  }

  const cancelarEdicao = () => {
    setEditandoId(null)
    setEditError(null)
  }

  const handleEditar = async (e: FormEvent) => {
    e.preventDefault()
    if (!editandoId) return
    setEditError(null)
    setEditSaving(true)
    try {
      await atualizar(editandoId, editForm)
      setEditandoId(null)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : (err as { message?: string }).message ?? 'Erro ao salvar')
    } finally {
      setEditSaving(false)
    }
  }

  const handleRemover = async (id: string) => {
    setDeleteError(null)
    try {
      await remover(id)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : (err as { message?: string }).message ?? 'Erro ao remover')
    }
  }

  if (loading) return <p className={styles.loading}>carregando...</p>
  if (error) return <p className={styles.error}>{error}</p>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>rendas fixas</h1>
        <div className={styles.totalBox}>
          <span className={styles.totalLabel}>total mensal</span>
          <span className={styles.totalValue}>{fmtBRL(total)}</span>
        </div>
      </div>

      <FormCard title="nova renda fixa" onSubmit={(e) => { void handleSubmit(e) }} submitLabel={saving ? 'salvando...' : 'adicionar'}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>descrição</label>
          <input value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} required placeholder="ex: salário" />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>valor mensal</label>
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
          <label className={styles.label}>categoria</label>
          <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value as CategoriaRendaFixa }))}>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {formError && <p className={styles.error}>{formError}</p>}
      </FormCard>

      {deleteError && <p className={styles.error}>{deleteError}</p>}

      {rendasFixas.length === 0 ? (
        <p className={styles.empty}>nenhuma renda fixa cadastrada.</p>
      ) : (
        <div className={styles.list}>
          {rendasFixas.map(r => (
            <div key={r.id} className={styles.item}>
              {editandoId === r.id ? (
                <form onSubmit={(e) => { void handleEditar(e) }} className={styles.editForm}>
                  <div className={styles.editGrid}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>descrição</label>
                      <input value={editForm.descricao} onChange={e => setEditForm(p => ({ ...p, descricao: e.target.value }))} required />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>valor mensal</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={editValorStr}
                        required
                        onChange={e => {
                          const str = e.target.value
                          setEditValorStr(str)
                          const num = parseFloat(str.replace(',', '.'))
                          setEditForm(p => ({ ...p, valor: isNaN(num) ? 0 : num }))
                        }}
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>categoria</label>
                      <select value={editForm.categoria} onChange={e => setEditForm(p => ({ ...p, categoria: e.target.value as CategoriaRendaFixa }))}>
                        {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  {editError && <p className={styles.error}>{editError}</p>}
                  <div className={styles.editActions}>
                    <button type="submit" className={styles.btnSalvar} disabled={editSaving}>
                      {editSaving ? 'salvando...' : 'salvar'}
                    </button>
                    <button type="button" className={styles.btnCancelar} onClick={cancelarEdicao}>
                      cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className={styles.row}>
                  <div className={styles.rowLeft}>
                    <span className={styles.rowDescricao}>{r.descricao}</span>
                    <span className={styles.rowCategoria}>{r.categoria}</span>
                  </div>
                  <div className={styles.rowRight}>
                    <span className={styles.rowValor}>{fmtBRL(r.valor)}</span>
                    <div className={styles.rowActions}>
                      <button className={styles.btnEditar} onClick={() => abrirEdicao(r)}>editar</button>
                      <button className={styles.btnRemover} onClick={() => void handleRemover(r.id)}>×</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
