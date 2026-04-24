import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { RendaFixa, NovaRendaFixa } from '@/types/index'

interface UseRendasFixasReturn {
  rendasFixas: RendaFixa[]
  loading: boolean
  error: string | null
  adicionar: (nova: NovaRendaFixa) => Promise<void>
  atualizar: (id: string, updates: NovaRendaFixa) => Promise<void>
  remover: (id: string) => Promise<void>
  recarregar: () => void
}

export function useRendasFixas(): UseRendasFixasReturn {
  const [rendasFixas, setRendasFixas] = useState<RendaFixa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('rendas_fixas')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setRendasFixas((data as RendaFixa[]) ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const adicionar = async (nova: NovaRendaFixa) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { error: err } = await supabase
      .from('rendas_fixas')
      .insert({ ...nova, user_id: user.id })

    if (err) throw err
    void carregar()
  }

  const atualizar = async (id: string, updates: NovaRendaFixa) => {
    const { error: err } = await supabase
      .from('rendas_fixas')
      .update(updates)
      .eq('id', id)

    if (err) throw err
    void carregar()
  }

  const remover = async (id: string) => {
    const { error: err } = await supabase
      .from('rendas_fixas')
      .delete()
      .eq('id', id)

    if (err) throw err
    void carregar()
  }

  return { rendasFixas, loading, error, adicionar, atualizar, remover, recarregar: carregar }
}
