export function fmtBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function fmtMes(isoMonth: string): string {
  const [year, month] = isoMonth.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function fmtData(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function mesAtual(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function intervaloMesAtual(): { inicio: string; fim: string } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const inicio = new Date(year, month, 1).toISOString().slice(0, 10)
  const fim = new Date(year, month + 1, 0).toISOString().slice(0, 10)
  return { inicio, fim }
}
