import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Divida, NovaDivida } from '@/types/index'

interface UseDividasReturn {
  dividas: Divida[]
  loading: boolean
  error: string | null
  adicionar: (nova: NovaDivida) => Promise<void>
  atualizarParcela: (id: string, parcelasPagas: number) => Promise<void>
  remover: (id: string) => Promise<void>
  recarregar: () => void
}

export function useDividas(): UseDividasReturn {
  const [dividas, setDividas] = useState<Divida[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('dividas')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setDividas((data as Divida[]) ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const adicionar = async (nova: NovaDivida) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { error: err } = await supabase
      .from('dividas')
      .insert({ ...nova, user_id: user.id })

    if (err) throw err
    void carregar()
  }

  const atualizarParcela = async (id: string, parcelasPagas: number) => {
    const { error: err } = await supabase
      .from('dividas')
      .update({ parcelas_pagas: parcelasPagas })
      .eq('id', id)

    if (err) throw err
    void carregar()
  }

  const remover = async (id: string) => {
    const { error: err } = await supabase
      .from('dividas')
      .delete()
      .eq('id', id)

    if (err) throw err
    void carregar()
  }

  return { dividas, loading, error, adicionar, atualizarParcela, remover, recarregar: carregar }
}
