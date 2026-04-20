import { useMemo } from 'react'
import { useDividas } from '@/hooks/useDividas'
import { useGastos } from '@/hooks/useGastos'
import { useInvestimentos } from '@/hooks/useInvestimentos'
import { SummaryCard } from '@/components/ui/SummaryCard'
import { mesAtual, fmtMes } from '@/utils/format'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const mes = mesAtual()
  const { dividas, loading: ldiv } = useDividas()
  const { gastos, loading: lgastos } = useGastos(mes)
  const { investimentos, loading: linv } = useInvestimentos(mes)

  const totalDividas = useMemo(() =>
    dividas.reduce((acc, d) => {
      const restantes = d.total_parcelas - d.parcelas_pagas
      return acc + restantes * d.valor_parcela
    }, 0),
    [dividas]
  )

  const totalGastos = useMemo(() =>
    gastos.reduce((acc, g) => acc + g.valor, 0),
    [gastos]
  )

  const totalInvestimentos = useMemo(() =>
    investimentos.reduce((acc, i) => acc + i.valor, 0),
    [investimentos]
  )

  const saldoMes = totalInvestimentos - totalGastos

  const loading = ldiv || lgastos || linv

  if (loading) return <p className={styles.loading}>carregando...</p>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>visão geral</h1>
        <span className={styles.mes}>{fmtMes(mes)}</span>
      </div>
      <div className={styles.grid}>
        <SummaryCard label="saldo do mês"         value={saldoMes}           accent="green" />
        <SummaryCard label="total em dívidas"      value={totalDividas}       accent="red"   />
        <SummaryCard label="gastos do mês"         value={totalGastos}        accent="blue"  />
        <SummaryCard label="investimentos do mês"  value={totalInvestimentos} accent="amber" />
      </div>
    </div>
  )
}
