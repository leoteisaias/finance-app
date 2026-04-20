export type CategoriaDivida =
  | 'cartão de crédito'
  | 'financiamento'
  | 'pessoal'
  | 'outro'

export type CategoriaGasto =
  | 'alimentação'
  | 'transporte'
  | 'saúde'
  | 'lazer'
  | 'casa'
  | 'educação'
  | 'outros'

export type CategoriaInvestimento =
  | 'renda fixa'
  | 'ações'
  | 'cripto'
  | 'fundo'
  | 'poupança'
  | 'outro'

export interface Divida {
  id: string
  user_id: string
  nome: string
  valor_total: number
  valor_parcela: number
  total_parcelas: number
  parcelas_pagas: number
  mes_inicio: string
  categoria: CategoriaDivida
  created_at: string
}

export interface DividaAntiga {
  id: string
  user_id: string
  nome: string
  valor: number
  data_ref: string | null
  observacao: string | null
  created_at: string
}

export interface Gasto {
  id: string
  user_id: string
  descricao: string
  valor: number
  data: string
  categoria: CategoriaGasto
  created_at: string
}

export interface Investimento {
  id: string
  user_id: string
  descricao: string
  valor: number
  categoria: CategoriaInvestimento
  data: string
  created_at: string
}

export type NovaDivida = Omit<Divida, 'id' | 'user_id' | 'created_at'>
export type NovaDividaAntiga = Omit<DividaAntiga, 'id' | 'user_id' | 'created_at'>
export type NovoGasto = Omit<Gasto, 'id' | 'user_id' | 'created_at'>
export type NovoInvestimento = Omit<Investimento, 'id' | 'user_id' | 'created_at'>

export interface Database {
  public: {
    Tables: {
      dividas: {
        Row: Divida
        Insert: NovaDivida & { user_id: string }
        Update: Partial<NovaDivida>
      }
      dividas_antigas: {
        Row: DividaAntiga
        Insert: NovaDividaAntiga & { user_id: string }
        Update: Partial<NovaDividaAntiga>
      }
      gastos: {
        Row: Gasto
        Insert: NovoGasto & { user_id: string }
        Update: Partial<NovoGasto>
      }
      investimentos: {
        Row: Investimento
        Insert: NovoInvestimento & { user_id: string }
        Update: Partial<NovoInvestimento>
      }
    }
  }
}
