import { useState, useMemo } from 'react'
import { useDividas } from '@/hooks/useDividas'
import { useGastos } from '@/hooks/useGastos'
import { useInvestimentos } from '@/hooks/useInvestimentos'
import { useRendasFixas } from '@/hooks/useRendasFixas'
import { useRendasVariaveis } from '@/hooks/useRendasVariaveis'
import { SummaryCard } from '@/components/ui/SummaryCard'
import { mesAtual } from '@/utils/format'
import styles from './DashboardPage.module.css'

function gerarOpcoesMeses(): string[] {
  const hoje = mesAtual()
  const [anoAtual, mesAtual_] = hoje.split('-').map(Number)
  const meses: string[] = []
  for (let i = 0; i < 12; i++) {
    let m = mesAtual_ + i
    let a = anoAtual
    while (m > 12) { m -= 12; a++ }
    meses.push(`${a}-${String(m).padStart(2, '0')}`)
  }
  return meses
}

function fmtMesSimples(isoMonth: string): string {
  const [year, month] = isoMonth.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(year, month - 1, 1))
}

const OPCOES_MESES = gerarOpcoesMeses()

export function DashboardPage() {
  const [mes, setMes] = useState(mesAtual())
  const { dividas, loading: ldiv } = useDividas()
  const { gastos, loading: lgastos } = useGastos(mes)
  const { investimentos, loading: linv } = useInvestimentos(mes)
  const { rendasFixas, loading: lrfix } = useRendasFixas()
  const { rendasVariaveis, loading: lrvar } = useRendasVariaveis(mes)

  const totalDividas = useMemo(() => {
    const [anoRef, mesRef] = mes.split('-').map(Number)
    return dividas.reduce((acc, d) => {
      const [anoInicio, mesInicio] = d.mes_inicio.slice(0, 7).split('-').map(Number)
      // quantos meses se passaram desde o início da dívida até o mês de referência
      const mesesDecorridos = (anoRef - anoInicio) * 12 + (mesRef - mesInicio)
      // a dívida tem parcela no mês de referência se já começou e ainda não terminou
      if (mesesDecorridos >= 0 && mesesDecorridos < d.total_parcelas) {
        return acc + d.valor_parcela
      }
      return acc
    }, 0)
  }, [dividas, mes])

  const totalGastos = useMemo(() =>
    gastos.reduce((acc, g) => acc + g.valor, 0),
    [gastos]
  )

  const totalInvestimentos = useMemo(() =>
    investimentos.reduce((acc, i) => acc + i.valor, 0),
    [investimentos]
  )

  const totalRendas = useMemo(() =>
    rendasFixas.reduce((acc, r) => acc + r.valor, 0) +
    rendasVariaveis.reduce((acc, r) => acc + r.valor, 0),
    [rendasFixas, rendasVariaveis]
  )

  const loading = ldiv || lgastos || linv || lrfix || lrvar

  if (loading) return <p className={styles.loading}>carregando...</p>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Visão geral</h1>
        <div className={styles.mesPicker}>
          <select
            value={mes}
            onChange={e => setMes(e.target.value)}
            className={styles.mesSelect}
          >
            {OPCOES_MESES.map(m => (
              <option key={m} value={m}>{fmtMesSimples(m)}</option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.grid}>
        <SummaryCard label="Rendas do Mês" value={totalRendas} accent="green" to="/rendas/fixas" />
        <SummaryCard label="Gastos do Mês" value={totalGastos} accent="blue" to="/gastos" />
        <SummaryCard label="Parcelas do Mês" value={totalDividas} accent="red" to="/dividas" />
        <SummaryCard label="Investimentos" value={totalInvestimentos} accent="amber" to="/investimentos" />
      </div>
    </div>
  )
}
