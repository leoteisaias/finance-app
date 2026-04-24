import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { RendaVariavel, NovaRendaVariavel } from '@/types/index'

interface UseRendasVariaveisReturn {
  rendasVariaveis: RendaVariavel[]
  loading: boolean
  error: string | null
  adicionar: (nova: NovaRendaVariavel) => Promise<void>
  atualizar: (id: string, updates: NovaRendaVariavel) => Promise<void>
  remover: (id: string) => Promise<void>
  recarregar: () => void
}

export function useRendasVariaveis(mesISO?: string): UseRendasVariaveisReturn {
  const [rendasVariaveis, setRendasVariaveis] = useState<RendaVariavel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('rendas_variaveis')
      .select('*')
      .order('data', { ascending: false })

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
      setRendasVariaveis((data as RendaVariavel[]) ?? [])
    }
    setLoading(false)
  }, [mesISO])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const adicionar = async (nova: NovaRendaVariavel) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { error: err } = await supabase
      .from('rendas_variaveis')
      .insert({ ...nova, user_id: user.id })

    if (err) throw err
    void carregar()
  }

  const atualizar = async (id: string, updates: NovaRendaVariavel) => {
    const { error: err } = await supabase
      .from('rendas_variaveis')
      .update(updates)
      .eq('id', id)

    if (err) throw err
    void carregar()
  }

  const remover = async (id: string) => {
    const { error: err } = await supabase
      .from('rendas_variaveis')
      .delete()
      .eq('id', id)

    if (err) throw err
    void carregar()
  }

  return { rendasVariaveis, loading, error, adicionar, atualizar, remover, recarregar: carregar }
}
