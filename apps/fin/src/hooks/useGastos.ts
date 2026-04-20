import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Gasto, NovoGasto } from '@/types/index'

interface UseGastosReturn {
  gastos: Gasto[]
  loading: boolean
  error: string | null
  adicionar: (novo: NovoGasto) => Promise<void>
  remover: (id: string) => Promise<void>
  recarregar: () => void
}

export function useGastos(mesISO?: string): UseGastosReturn {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase.from('gastos').select('*').order('data', { ascending: false })

    if (mesISO) {
      const [year, month] = mesISO.split('-').map(Number)
      const inicio = new Date(year, month - 1, 1).toISOString().slice(0, 10)
      const fim = new Date(year, month, 0).toISOString().slice(0, 10)
      query = query.gte('data', inicio).lte('data', fim)
    }

    const { data, error: err } = await query

    if (err) {
      setError(err.message)
    } else {
      setGastos((data as Gasto[]) ?? [])
    }
    setLoading(false)
  }, [mesISO])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const adicionar = async (novo: NovoGasto) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { error: err } = await supabase
      .from('gastos')
      .insert({ ...novo, user_id: user.id })

    if (err) throw err
    void carregar()
  }

  const remover = async (id: string) => {
    const { error: err } = await supabase
      .from('gastos')
      .delete()
      .eq('id', id)

    if (err) throw err
    void carregar()
  }

  return { gastos, loading, error, adicionar, remover, recarregar: carregar }
}
