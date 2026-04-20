---
name: fin-app
description: >
  App de controle financeiro pessoal chamado "fin." — construído com React + TypeScript
  e Supabase como backend. Use este skill sempre que for criar, editar ou expandir
  qualquer parte do app fin.: telas, componentes, rotas, queries Supabase, autenticação,
  lógica de negócio ou estrutura de banco de dados.
---

# fin. — App de Finanças Pessoais

App web de controle financeiro pessoal. React + TypeScript no frontend, Supabase
como banco de dados e autenticação.

---

## 1. Visão geral do produto

**Nome:** fin.
**Tagline:** controle financeiro pessoal
**Público:** uso pessoal — uma conta por pessoa, dados privados

### Funcionalidades principais

| Módulo | Descrição |
|---|---|
| Dashboard | Resumo financeiro do mês atual |
| Dívidas ativas | Compras parceladas em andamento |
| Dívidas antigas | Dívidas que pararam de ser pagas |
| Gastos do dia a dia | Registro de despesas cotidianas |
| Investimentos | Registro de aplicações financeiras |

---

## 2. Stack técnica

- **Frontend:** React 18 + TypeScript + Vite
- **Estilização:** CSS Modules ou Tailwind CSS (seguindo identidade visual — ver seção 4)
- **Backend / DB:** Supabase (PostgreSQL + Auth + RLS)
- **Autenticação:** Supabase Auth (email + senha)
- **Roteamento:** React Router v6
- **Estado global:** Context API ou Zustand (leve, sem Redux)
- **Formatação de moeda:** `Intl.NumberFormat` com locale `pt-BR` e currency `BRL`

---

## 3. Estrutura de pastas

```
src/
├── components/
│   ├── ui/             # Componentes base reutilizáveis (Button, Card, Badge, Input...)
│   ├── dashboard/      # Componentes do Dashboard
│   ├── dividas/        # Dívidas ativas
│   ├── antigas/        # Dívidas antigas
│   ├── gastos/         # Gastos do dia a dia
│   └── investimentos/  # Investimentos
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── DiviasPage.tsx
│   ├── AntigasPage.tsx
│   ├── GastosPage.tsx
│   └── InvestimentosPage.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useDividas.ts
│   ├── useAntigas.ts
│   ├── useGastos.ts
│   └── useInvestimentos.ts
├── lib/
│   └── supabase.ts     # Client do Supabase
├── types/
│   └── index.ts        # Tipos TypeScript globais
└── utils/
    └── format.ts       # Formatação de moeda e datas
```

---

## 4. Identidade visual

O app segue **rigorosamente** a identidade visual dark/neon do portfólio do usuário.

### Tokens de cor

```css
:root {
  --bg:           #0a0a0a;
  --bg2:          #111111;
  --bg3:          #1a1a1a;
  --border:       rgba(255,255,255,0.08);
  --border-hover: rgba(255,255,255,0.18);
  --text:         #f0f0ee;
  --muted:        #666666;
  --muted2:       #444444;
  --green:        #4dff91;   /* acento principal — único destaque vibrante */
  --green-dim:    rgba(77,255,145,0.08);
  --green-glow:   rgba(77,255,145,0.18);
  --red:          #ff5c5c;   /* dívidas / pendências */
  --amber:        #ffc14d;   /* dívidas antigas / alertas */
  --blue:         #4db8ff;   /* gastos / neutro */
}
```

### Tipografia

```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

- **Syne** → headlines, valores numéricos grandes, títulos de seção
- **DM Mono** → labels, descrições, badges, datas, corpo do app

### Regras visuais

- Fundo sempre escuro (`--bg`, `--bg2`, `--bg3`)
- Verde (`--green`) apenas em destaques máximos — CTAs, status ativo, progresso positivo
- Vermelho para dívidas/pendências, âmbar para alertas, azul para gastos
- Bordas finas `1px`, nunca `2px+`
- `border-radius` generoso nos cards (12px–16px), 100px nos badges e botões pill
- Sem sombras decorativas
- Animações sutis — `transition: 0.15s–0.2s ease`

---

## 5. Banco de dados (Supabase)

### Tabelas

```sql
-- Usuários gerenciados pelo Supabase Auth (tabela auth.users)

-- Dívidas ativas (parceladas)
create table dividas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  nome        text not null,
  valor_total numeric(12,2) not null,
  valor_parcela numeric(12,2) not null,
  total_parcelas int not null,
  parcelas_pagas int default 0,
  mes_inicio  date not null,         -- primeiro mês da parcela
  categoria   text default 'outro',  -- 'cartão de crédito' | 'financiamento' | 'pessoal' | 'outro'
  created_at  timestamptz default now()
);

-- Dívidas antigas (que pararam de ser pagas)
create table dividas_antigas (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  nome       text not null,
  valor      numeric(12,2) not null,
  data_ref   date,                   -- data aproximada da dívida
  observacao text,
  created_at timestamptz default now()
);

-- Gastos do dia a dia
create table gastos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  descricao  text not null,
  valor      numeric(12,2) not null,
  data       date not null,
  categoria  text not null,          -- ver lista abaixo
  created_at timestamptz default now()
);

-- Investimentos
create table investimentos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  descricao  text not null,
  valor      numeric(12,2) not null,
  categoria  text not null,          -- ver lista abaixo
  data       date not null,
  created_at timestamptz default now()
);
```

### RLS (Row Level Security)

Todas as tabelas devem ter RLS ativado. Política padrão para todas:

```sql
-- Ativar RLS
alter table dividas enable row level security;
alter table dividas_antigas enable row level security;
alter table gastos enable row level security;
alter table investimentos enable row level security;

-- Política: usuário só acessa seus próprios dados
create policy "user_own_data" on dividas
  for all using (auth.uid() = user_id);

-- Repetir para as demais tabelas
```

### Categorias

```ts
// Gastos do dia a dia
const CATS_GASTO = [
  'alimentação', 'transporte', 'saúde', 'lazer',
  'casa', 'educação', 'outros'
] as const;

// Investimentos
const CATS_INV = [
  'renda fixa', 'ações', 'cripto', 'fundo', 'poupança', 'outro'
] as const;

// Dívidas ativas
const CATS_DIVIDA = [
  'cartão de crédito', 'financiamento', 'pessoal', 'outro'
] as const;
```

---

## 6. Autenticação

- Usar `supabase.auth.signUp()` para cadastro (email + senha)
- Usar `supabase.auth.signInWithPassword()` para login
- Usar `supabase.auth.signOut()` para logout
- Proteger todas as rotas autenticadas com um `<PrivateRoute>` que verifica a sessão
- Sessão persistida automaticamente pelo Supabase

```ts
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

---

## 7. Lógica de negócio

### Dashboard — cálculos do mês atual

```ts
// Pendências do mês = soma das parcelas com vencimento no mês atual e não pagas
// Uma dívida tem parcela no mês M se:
//   mes_inicio <= M  &&  (mes_inicio + total_parcelas meses) > M
//   E parcelas_pagas < índice_da_parcela_daquele_mês

// Dívidas antigas = soma de todas as dividas_antigas.valor

// Investimentos = soma de todos os investimentos.valor

// Gastos do mês = soma dos gastos onde data >= início_do_mês_atual
```

### Parcelas de dívidas ativas

Cada dívida ativa tem `total_parcelas` e `parcelas_pagas`. O campo `mes_inicio`
define quando começa. Para calcular os meses:

```ts
function getMesesParcelas(divida: Divida): string[] {
  return Array.from({ length: divida.total_parcelas }, (_, i) => {
    const d = new Date(divida.mes_inicio);
    d.setMonth(d.getMonth() + i);
    return d.toISOString().slice(0, 7); // 'YYYY-MM'
  });
}
```

"Pagar próxima parcela" = incrementar `parcelas_pagas` em 1 via update no Supabase.

---

## 8. Componentes essenciais

### SummaryCard
Card de resumo para o dashboard. Props: `label`, `value` (número), `sub` (texto),
`color` (`'red' | 'amber' | 'green' | 'blue'`).

### ItemRow
Linha de item para listas (dívidas, gastos, investimentos).
Props: `title`, `detail`, `amount`, `color`, `onDelete`, `actions?`.

### ProgressBar
Barra de progresso fina (4–6px). Props: `value` (0–100), `color`.

### Badge
Pill pequeno com cor semântica. Props: `label`, `variant`.

### FormCard
Wrapper de formulário com título interno. Usado em todas as abas para o formulário
de cadastro.

---

## 9. Formatação

```ts
// utils/format.ts

export const fmtBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

export const fmtMes = (isoMonth: string) => {
  const [year, month] = isoMonth.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
};

export const fmtData = (isoDate: string) =>
  new Date(isoDate + 'T12:00:00').toLocaleDateString('pt-BR');
```

---

## 10. Roadmap (fases futuras)

Estas funcionalidades **não devem ser implementadas agora**, mas o código deve
ser estruturado de forma que não dificulte adicioná-las depois:

- [ ] Negociação de dívida antiga (simulação de parcelamento)
- [ ] Relatório mensal exportável (PDF)
- [ ] Gráfico histórico de gastos por categoria
- [ ] Metas de economia mensais
- [ ] IA para sugestão de negociação de dívidas

---

## 11. Regras gerais de desenvolvimento

- Sempre usar TypeScript estrito (`strict: true` no tsconfig)
- Sem `any` — tipar tudo corretamente
- Componentes funcionais com hooks — sem class components
- Queries Supabase sempre dentro de custom hooks (`use*.ts`)
- Tratar estados de loading e erro em todas as queries
- Datas sempre em ISO 8601 (`YYYY-MM-DD` ou `YYYY-MM`)
- Valores monetários sempre como `number` no JS, nunca string
- Arredondar sempre antes de exibir: `toFixed(2)` ou `Intl.NumberFormat`
- Comentários em português
