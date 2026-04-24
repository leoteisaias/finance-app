import { useState, type FormEvent } from 'react'
import { useRendasVariaveis } from '@/hooks/useRendasVariaveis'
import { FormCard } from '@/components/ui/FormCard'
import { mesAtual, fmtMes, fmtBRL, fmtData } from '@/utils/format'
import type { NovaRendaVariavel, CategoriaRendaVariavel, RendaVariavel } from '@/types/index'
import styles from './RendasVariaveisPage.module.css'

const CATEGORIAS: CategoriaRendaVariavel[] = ['freelance', 'bônus', 'venda', 'dividendo', 'outro']

const hoje = new Date().toISOString().slice(0, 10)

const FORM_INICIAL: NovaRendaVariavel = {
  descricao: '',
  valor: 0,
  data: hoje,
  categoria: 'freelance',
}

function rendaParaForm(r: RendaVariavel): NovaRendaVariavel {
  return { descricao: r.descricao, valor: r.valor, data: r.data, categoria: r.categoria }
}

export function RendasVariaveisPage() {
  const mes = mesAtual()
  const { rendasVariaveis, loading, error, adicionar, atualizar, remover } = useRendasVariaveis(mes)
  const [form, setForm] = useState<NovaRendaVariavel>(FORM_INICIAL)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<NovaRendaVariavel>(FORM_INICIAL)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const total = rendasVariaveis.reduce((acc, r) => acc + r.valor, 0)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      await adicionar(form)
      setForm({ ...FORM_INICIAL, data: new Date().toISOString().slice(0, 10) })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao adicionar')
    } finally {
      setSaving(false)
    }
  }

  const abrirEdicao = (r: RendaVariavel) => {
    setEditandoId(r.id)
    setEditForm(rendaParaForm(r))
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
      setEditError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setEditSaving(false)
    }
  }

  const handleRemover = async (id: string) => {
    setDeleteError(null)
    try {
      await remover(id)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erro ao remover')
    }
  }

  if (loading) return <p className={styles.loading}>carregando...</p>
  if (error) return <p className={styles.error}>{error}</p>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>rendas variáveis</h1>
        <div className={styles.totalBox}>
          <span className={styles.totalLabel}>{fmtMes(mes)}</span>
          <span className={styles.totalValue}>{fmtBRL(total)}</span>
        </div>
      </div>

      <FormCard title="nova renda variável" onSubmit={(e) => { void handleSubmit(e) }} submitLabel={saving ? 'salvando...' : 'adicionar'}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>descrição</label>
          <input value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} required placeholder="ex: projeto cliente X" />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>valor</label>
          <input type="number" min="0.01" step="0.01" value={form.valor || ''} onChange={e => setForm(p => ({ ...p, valor: parseFloat(e.target.value) || 0 }))} required />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>data</label>
          <input type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} required />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>categoria</label>
          <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value as CategoriaRendaVariavel }))}>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {formError && <p className={styles.error}>{formError}</p>}
      </FormCard>

      {deleteError && <p className={styles.error}>{deleteError}</p>}

      {rendasVariaveis.length === 0 ? (
        <p className={styles.empty}>nenhuma renda variável registrada este mês.</p>
      ) : (
        <div className={styles.list}>
          {rendasVariaveis.map(r => (
            <div key={r.id} className={styles.item}>
              {editandoId === r.id ? (
                <form onSubmit={(e) => { void handleEditar(e) }} className={styles.editForm}>
                  <div className={styles.editGrid}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>descrição</label>
                      <input value={editForm.descricao} onChange={e => setEditForm(p => ({ ...p, descricao: e.target.value }))} required />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>valor</label>
                      <input type="number" min="0.01" step="0.01" value={editForm.valor || ''} onChange={e => setEditForm(p => ({ ...p, valor: parseFloat(e.target.value) || 0 }))} required />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>data</label>
                      <input type="date" value={editForm.data} onChange={e => setEditForm(p => ({ ...p, data: e.target.value }))} required />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>categoria</label>
                      <select value={editForm.categoria} onChange={e => setEditForm(p => ({ ...p, categoria: e.target.value as CategoriaRendaVariavel }))}>
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
                    <span className={styles.rowMeta}>{fmtData(r.data)} · {r.categoria}</span>
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
