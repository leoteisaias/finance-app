import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Investimento, NovoInvestimento } from '@/types/index'

interface UseInvestimentosReturn {
  investimentos: Investimento[]
  loading: boolean
  error: string | null
  adicionar: (novo: NovoInvestimento) => Promise<void>
  remover: (id: string) => Promise<void>
  recarregar: () => void
}

export function useInvestimentos(mesISO?: string): UseInvestimentosReturn {
  const [investimentos, setInvestimentos] = useState<Investimento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase.from('investimentos').select('*').order('data', { ascending: false })

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
      setInvestimentos((data as Investimento[]) ?? [])
    }
    setLoading(false)
  }, [mesISO])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const adicionar = async (novo: NovoInvestimento) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { error: err } = await supabase
      .from('investimentos')
      .insert({ ...novo, user_id: user.id })

    if (err) throw err
    void carregar()
  }

  const remover = async (id: string) => {
    const { error: err } = await supabase
      .from('investimentos')
      .delete()
      .eq('id', id)

    if (err) throw err
    void carregar()
  }

  return { investimentos, loading, error, adicionar, remover, recarregar: carregar }
}
