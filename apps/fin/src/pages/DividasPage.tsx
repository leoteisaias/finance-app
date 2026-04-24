import { useState, type FormEvent } from 'react'
import { useDividas } from '@/hooks/useDividas'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { FormCard } from '@/components/ui/FormCard'
import { fmtBRL } from '@/utils/format'
import type { NovaDivida, CategoriaDivida, Divida } from '@/types/index'
import styles from './DividasPage.module.css'

const CATEGORIAS: CategoriaDivida[] = ['cartão de crédito', 'financiamento', 'pessoal', 'outro']

const FORM_INICIAL: NovaDivida = {
  nome: '',
  valor_total: null,
  valor_parcela: 0,
  total_parcelas: 1,
  parcelas_pagas: 0,
  mes_inicio: new Date().toISOString().slice(0, 7) + '-01',
  dia_vencimento: null,
  categoria: 'outro',
}

function dividaParaForm(d: Divida): NovaDivida {
  return {
    nome: d.nome,
    valor_total: d.valor_total,
    valor_parcela: d.valor_parcela,
    total_parcelas: d.total_parcelas,
    parcelas_pagas: d.parcelas_pagas,
    mes_inicio: d.mes_inicio,
    dia_vencimento: d.dia_vencimento,
    categoria: d.categoria,
  }
}

export function DividasPage() {
  const { dividas, loading, error, adicionar, atualizar, atualizarParcela, remover } = useDividas()
  const [form, setForm] = useState<NovaDivida>(FORM_INICIAL)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [valorTotalStr, setValorTotalStr] = useState('')
  const [valorParcelaStr, setValorParcelaStr] = useState('')

  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<NovaDivida>(FORM_INICIAL)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [editValorTotalStr, setEditValorTotalStr] = useState('')
  const [editValorParcelaStr, setEditValorParcelaStr] = useState('')

  const set = (field: keyof NovaDivida, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const setEdit = (field: keyof NovaDivida, value: string | number) =>
    setEditForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      await adicionar(form)
      setForm(FORM_INICIAL)
      setValorTotalStr('')
      setValorParcelaStr('')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : (err as { message?: string }).message ?? 'Erro ao adicionar')
    } finally {
      setSaving(false)
    }
  }

  const abrirEdicao = (d: Divida) => {
    setEditandoId(d.id)
    setEditForm(dividaParaForm(d))
    setEditValorTotalStr(d.valor_total != null ? String(d.valor_total) : '')
    setEditValorParcelaStr(String(d.valor_parcela))
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
      <h1 className={styles.heading}>dívidas ativas</h1>

      <FormCard title="nova dívida" onSubmit={(e) => { void handleSubmit(e) }} submitLabel={saving ? 'salvando...' : 'adicionar'}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>nome</label>
          <input value={form.nome} onChange={e => set('nome', e.target.value)} required placeholder="ex: notebook" />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>valor total <span className={styles.opcional}>(opcional)</span></label>
          <input
            type="text"
            inputMode="decimal"
            value={valorTotalStr}
            placeholder="ex: 3000"
            onChange={e => {
              const str = e.target.value
              setValorTotalStr(str)
              const num = parseFloat(str.replace(',', '.'))
              set('valor_total', str === '' ? null as unknown as number : isNaN(num) ? null as unknown as number : num)
            }}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>valor parcela</label>
          <input
            type="text"
            inputMode="decimal"
            value={valorParcelaStr}
            required
            onChange={e => {
              const str = e.target.value
              setValorParcelaStr(str)
              const num = parseFloat(str.replace(',', '.'))
              set('valor_parcela', isNaN(num) ? 0 : num)
            }}
          />
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
          <label className={styles.label}>dia de vencimento</label>
          <input
            type="number" min="1" max="31" placeholder="ex: 10"
            value={form.dia_vencimento ?? ''}
            onChange={e => set('dia_vencimento', e.target.value ? parseInt(e.target.value) : null as unknown as number)}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>categoria</label>
          <select value={form.categoria} onChange={e => set('categoria', e.target.value as CategoriaDivida)}>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {formError && <p className={styles.error}>{formError}</p>}
      </FormCard>

      {deleteError && <p className={styles.error}>{deleteError}</p>}

      {dividas.length === 0 ? (
        <p className={styles.empty}>nenhuma dívida ativa. boa!</p>
      ) : (
        <div className={styles.list}>
          {dividas.map(d => {
            const concluida = d.parcelas_pagas >= d.total_parcelas
            const editando = editandoId === d.id

            return (
              <div key={d.id} className={`${styles.item} ${concluida ? styles.concluida : ''}`}>
                {editando ? (
                  <form onSubmit={(e) => { void handleEditar(e) }} className={styles.editForm}>
                    <div className={styles.editGrid}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>nome</label>
                        <input value={editForm.nome} onChange={e => setEdit('nome', e.target.value)} required />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>valor total <span className={styles.opcional}>(opcional)</span></label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={editValorTotalStr}
                          placeholder="ex: 3000"
                          onChange={e => {
                            const str = e.target.value
                            setEditValorTotalStr(str)
                            const num = parseFloat(str.replace(',', '.'))
                            setEdit('valor_total', str === '' ? null as unknown as number : isNaN(num) ? null as unknown as number : num)
                          }}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>valor parcela</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={editValorParcelaStr}
                          required
                          onChange={e => {
                            const str = e.target.value
                            setEditValorParcelaStr(str)
                            const num = parseFloat(str.replace(',', '.'))
                            setEdit('valor_parcela', isNaN(num) ? 0 : num)
                          }}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>total parcelas</label>
                        <input type="number" min="1" step="1" value={editForm.total_parcelas} onChange={e => setEdit('total_parcelas', parseInt(e.target.value) || 1)} required />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>mês início</label>
                        <input type="month" value={editForm.mes_inicio.slice(0, 7)} onChange={e => setEdit('mes_inicio', e.target.value + '-01')} required />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>dia de vencimento</label>
                        <input
                          type="number" min="1" max="31" placeholder="ex: 10"
                          value={editForm.dia_vencimento ?? ''}
                          onChange={e => setEdit('dia_vencimento', e.target.value ? parseInt(e.target.value) : null as unknown as number)}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>categoria</label>
                        <select value={editForm.categoria} onChange={e => setEdit('categoria', e.target.value as CategoriaDivida)}>
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
                  <>
                    <div className={styles.itemHeader}>
                      <div className={styles.itemLeft}>
                        <div className={styles.nomeGroup}>
                          <span className={styles.nome}>{d.nome}</span>
                          {d.dia_vencimento && (
                            <span className={styles.vencimento}>todo dia {d.dia_vencimento}</span>
                          )}
                        </div>
                        <Badge text={d.categoria} />
                      </div>
                      <div className={styles.itemRight}>
                        {d.valor_total != null && (
                          <span className={styles.valor}>{fmtBRL(d.valor_total)}</span>
                        )}
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
                      <button className={styles.btnEditar} onClick={() => abrirEdicao(d)}>
                        editar
                      </button>
                      <button className={styles.btnRemover} onClick={() => void handleRemover(d.id)}>
                        remover
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
