import { useState, type FormEvent } from 'react'
import { useAntigas } from '@/hooks/useAntigas'
import { ItemRow } from '@/components/ui/ItemRow'
import { FormCard } from '@/components/ui/FormCard'
import type { NovaDividaAntiga, DividaAntiga } from '@/types/index'
import styles from './AntigasPage.module.css'

const FORM_INICIAL: NovaDividaAntiga = {
  nome: '',
  valor: 0,
  data_ref: null,
  observacao: null,
}

function antigaParaForm(d: DividaAntiga): NovaDividaAntiga {
  return {
    nome: d.nome,
    valor: d.valor,
    data_ref: d.data_ref,
    observacao: d.observacao,
  }
}

export function AntigasPage() {
  const { antigas, loading, error, adicionar, atualizar, remover } = useAntigas()
  const [form, setForm] = useState<NovaDividaAntiga>(FORM_INICIAL)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<NovaDividaAntiga>(FORM_INICIAL)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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

  const abrirEdicao = (d: DividaAntiga) => {
    setEditandoId(d.id)
    setEditForm(antigaParaForm(d))
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

      {deleteError && <p className={styles.error}>{deleteError}</p>}

      {antigas.length === 0 ? (
        <p className={styles.empty}>nenhuma dívida antiga registrada.</p>
      ) : (
        <div className={styles.list}>
          {antigas.map(d => (
            <div key={d.id} className={styles.item}>
              {editandoId === d.id ? (
                <form onSubmit={(e) => { void handleEditar(e) }} className={styles.editForm}>
                  <div className={styles.editGrid}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>nome / credor</label>
                      <input value={editForm.nome} onChange={e => setEditForm(p => ({ ...p, nome: e.target.value }))} required />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>valor estimado</label>
                      <input type="number" min="0.01" step="0.01" value={editForm.valor || ''} onChange={e => setEditForm(p => ({ ...p, valor: parseFloat(e.target.value) || 0 }))} required />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>data de referência</label>
                      <input type="date" value={editForm.data_ref ?? ''} onChange={e => setEditForm(p => ({ ...p, data_ref: e.target.value || null }))} />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>observação</label>
                      <input value={editForm.observacao ?? ''} onChange={e => setEditForm(p => ({ ...p, observacao: e.target.value || null }))} />
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
                <div className={styles.itemRow}>
                  <ItemRow
                    label={d.nome}
                    value={d.valor}
                    date={d.data_ref ?? undefined}
                    category={d.observacao ?? undefined}
                    accent="amber"
                    onDelete={() => void handleRemover(d.id)}
                  />
                  <button className={styles.btnEditar} onClick={() => abrirEdicao(d)}>
                    editar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
