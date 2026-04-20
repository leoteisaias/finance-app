import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { DividaAntiga, NovaDividaAntiga } from '@/types/index'

interface UseAntigasReturn {
  antigas: DividaAntiga[]
  loading: boolean
  error: string | null
  adicionar: (nova: NovaDividaAntiga) => Promise<void>
  remover: (id: string) => Promise<void>
  recarregar: () => void
}

export function useAntigas(): UseAntigasReturn {
  const [antigas, setAntigas] = useState<DividaAntiga[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('dividas_antigas')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setAntigas((data as DividaAntiga[]) ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const adicionar = async (nova: NovaDividaAntiga) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { error: err } = await supabase
      .from('dividas_antigas')
      .insert({ ...nova, user_id: user.id })

    if (err) throw err
    void carregar()
  }

  const remover = async (id: string) => {
    const { error: err } = await supabase
      .from('dividas_antigas')
      .delete()
      .eq('id', id)

    if (err) throw err
    void carregar()
  }

  return { antigas, loading, error, adicionar, remover, recarregar: carregar }
}
