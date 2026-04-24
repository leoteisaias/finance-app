import { useState, type FormEvent } from 'react'
import { useAntigas } from '@/hooks/useAntigas'
import { useDividas } from '@/hooks/useDividas'
import { ItemRow } from '@/components/ui/ItemRow'
import { FormCard } from '@/components/ui/FormCard'
import type { NovaDividaAntiga, DividaAntiga, NovaDivida, CategoriaDivida } from '@/types/index'
import styles from './AntigasPage.module.css'

const CATEGORIAS: CategoriaDivida[] = ['cartão de crédito', 'financiamento', 'pessoal', 'outro']

const FORM_INICIAL: NovaDividaAntiga = {
  nome: '',
  valor: null,
  data_ref: null,
  observacao: null,
}

const NEGOC_INICIAL: Omit<NovaDivida, 'nome' | 'parcelas_pagas' | 'categoria'> = {
  valor_total: null,
  valor_parcela: 0,
  total_parcelas: 1,
  mes_inicio: new Date().toISOString().slice(0, 7) + '-01',
  dia_vencimento: null,
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
  const { adicionar: adicionarAtiva } = useDividas()

  const [form, setForm] = useState<NovaDividaAntiga>(FORM_INICIAL)
  const [valorStr, setValorStr] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<NovaDividaAntiga>(FORM_INICIAL)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [editValorStr, setEditValorStr] = useState('')

  const [negociandoId, setNegociandoId] = useState<string | null>(null)
  const [negocForm, setNegocForm] = useState(NEGOC_INICIAL)
  const [negocCategoria, setNegocCategoria] = useState<CategoriaDivida>('outro')
  const [negocSaving, setNegocSaving] = useState(false)
  const [negocError, setNegocError] = useState<string | null>(null)
  const [negocValorParcelaStr, setNegocValorParcelaStr] = useState('')
  const [negocValorTotalStr, setNegocValorTotalStr] = useState('')

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

  const abrirEdicao = (d: DividaAntiga) => {
    setEditandoId(d.id)
    setEditForm(antigaParaForm(d))
    setEditValorStr(d.valor ? String(d.valor) : '')
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

  const abrirNegociacao = (d: DividaAntiga) => {
    setNegociandoId(d.id)
    setNegocForm(NEGOC_INICIAL)
    setNegocCategoria('outro')
    setNegocValorParcelaStr('')
    setNegocValorTotalStr('')
    setNegocError(null)
  }

  const confirmarNegociacao = async (e: FormEvent) => {
    e.preventDefault()
    if (!negociandoId) return
    const original = antigas.find(d => d.id === negociandoId)
    if (!original) return
    setNegocSaving(true)
    setNegocError(null)
    try {
      await adicionarAtiva({
        nome: original.nome,
        categoria: negocCategoria,
        valor_parcela: negocForm.valor_parcela,
        total_parcelas: negocForm.total_parcelas,
        valor_total: negocForm.valor_total,
        dia_vencimento: negocForm.dia_vencimento,
        mes_inicio: negocForm.mes_inicio,
        parcelas_pagas: 0,
      })
      await remover(negociandoId)
      setNegociandoId(null)
    } catch (err) {
      setNegocError(err instanceof Error ? err.message : (err as { message?: string }).message ?? 'Erro ao negociar')
    } finally {
      setNegocSaving(false)
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
          <label className={styles.label}>valor estimado <span className={styles.opcional}>(opcional)</span></label>
          <input
            type="text"
            inputMode="decimal"
            value={valorStr}
            placeholder="ex: 1500,00"
            onChange={e => {
              const str = e.target.value
              setValorStr(str)
              const num = parseFloat(str.replace(',', '.'))
              setForm(p => ({ ...p, valor: isNaN(num) ? null : num }))
            }}
          />
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
                      <label className={styles.label}>valor estimado <span className={styles.opcional}>(opcional)</span></label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={editValorStr}
                        placeholder="ex: 1500,00"
                        onChange={e => {
                          const str = e.target.value
                          setEditValorStr(str)
                          const num = parseFloat(str.replace(',', '.'))
                          setEditForm(p => ({ ...p, valor: isNaN(num) ? null : num }))
                        }}
                      />
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
                  <div className={styles.itemActions}>
                    <button className={styles.btnEditar} onClick={() => abrirEdicao(d)}>
                      editar
                    </button>
                    <div className={styles.statusToggle}>
                      <span className={styles.statusAtiva}>ativa</span>
                      <button
                        type="button"
                        className={styles.statusNegociada}
                        onClick={() => abrirNegociacao(d)}
                      >
                        negociada
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {negociandoId && (
        <div className={styles.modalOverlay} onClick={() => setNegociandoId(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>negociar dívida</h2>
            <p className={styles.modalSubtitle}>
              {antigas.find(d => d.id === negociandoId)?.nome}
            </p>
            <form onSubmit={(e) => { void confirmarNegociacao(e) }} className={styles.modalForm}>
              <div className={styles.modalGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>valor da parcela</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={negocValorParcelaStr}
                    required
                    placeholder="ex: 250,00"
                    onChange={e => {
                      const str = e.target.value
                      setNegocValorParcelaStr(str)
                      const num = parseFloat(str.replace(',', '.'))
                      setNegocForm(p => ({ ...p, valor_parcela: isNaN(num) ? 0 : num }))
                    }}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>em quantas vezes</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={negocForm.total_parcelas}
                    required
                    onChange={e => setNegocForm(p => ({ ...p, total_parcelas: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>valor total <span className={styles.opcional}>(opcional)</span></label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={negocValorTotalStr}
                    placeholder="ex: 3000"
                    onChange={e => {
                      const str = e.target.value
                      setNegocValorTotalStr(str)
                      const num = parseFloat(str.replace(',', '.'))
                      setNegocForm(p => ({ ...p, valor_total: str === '' || isNaN(num) ? null : num }))
                    }}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>dia de vencimento <span className={styles.opcional}>(opcional)</span></label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="ex: 10"
                    value={negocForm.dia_vencimento ?? ''}
                    onChange={e => setNegocForm(p => ({ ...p, dia_vencimento: e.target.value ? parseInt(e.target.value) : null }))}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>mês de início</label>
                  <input
                    type="month"
                    value={negocForm.mes_inicio.slice(0, 7)}
                    required
                    onChange={e => setNegocForm(p => ({ ...p, mes_inicio: e.target.value + '-01' }))}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>categoria</label>
                  <select value={negocCategoria} onChange={e => setNegocCategoria(e.target.value as CategoriaDivida)}>
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {negocError && <p className={styles.error}>{negocError}</p>}
              <div className={styles.modalActions}>
                <button type="submit" className={styles.btnSalvar} disabled={negocSaving}>
                  {negocSaving ? 'salvando...' : 'confirmar'}
                </button>
                <button type="button" className={styles.btnCancelar} onClick={() => setNegociandoId(null)}>
                  cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
