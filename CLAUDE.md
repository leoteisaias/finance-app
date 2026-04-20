# CLAUDE.md — fin. (anti-gravity)

Regras, convenções e contexto de segurança do projeto **fin.** dentro do monorepo
anti-gravity. Leia este arquivo antes de qualquer tarefa.

---

## 1. O que é este projeto

**fin.** é um app web de controle financeiro pessoal.
Stack: React 18 + TypeScript + Vite + Supabase (Auth + PostgreSQL).
Múltiplos usuários — cada pessoa acessa apenas seus próprios dados.

---

## 2. Estrutura do monorepo

```
anti-gravity/
├── apps/
│   └── fin/                  # Este app
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── lib/
│       │   ├── types/
│       │   └── utils/
│       ├── .env.local         # ⚠️ NUNCA commitar — ver seção 4
│       ├── .env.example       # Modelo público sem valores reais
│       ├── index.html
│       ├── vite.config.ts
│       └── tsconfig.json
├── packages/
│   └── shared/               # Tipos e utilitários compartilhados (se houver)
├── .gitignore
└── package.json
```

> Se a estrutura de pastas acima ainda não existir, crie respeitando esse layout.
> Não mova nem renomeie pastas sem atualizar este arquivo.

---

## 3. Arquivos que o Claude PODE editar

| Caminho | Descrição |
|---|---|
| `apps/fin/src/**` | Todo o código-fonte do app |
| `apps/fin/vite.config.ts` | Configuração do Vite |
| `apps/fin/tsconfig.json` | Configuração do TypeScript |
| `apps/fin/.env.example` | Modelo de variáveis (sem valores reais) |
| `apps/fin/index.html` | Entry point HTML |
| `packages/shared/**` | Código compartilhado entre apps |
| `package.json` (raiz) | Scripts e dependências do monorepo |

## 4. Arquivos que o Claude NUNCA deve tocar

| Caminho | Motivo |
|---|---|
| `apps/fin/.env.local` | Contém chaves reais do Supabase |
| `apps/fin/.env.*.local` | Qualquer variação de env local |
| `.git/**` | Histórico de versões |
| `**/node_modules/**` | Dependências instaladas |
| `supabase/migrations/**` | Migrações já aplicadas em produção |

> Se precisar alterar variáveis de ambiente, edite apenas o `.env.example`
> e documente aqui o que foi adicionado.

---

## 5. Variáveis de ambiente

### Como configurar

Crie o arquivo `apps/fin/.env.local` copiando o `.env.example`:

```bash
cp apps/fin/.env.example apps/fin/.env.local
```

Depois preencha com os valores reais do painel do Supabase.

### Variáveis obrigatórias


### Regras de uso

- Toda variável exposta ao frontend **deve** começar com `VITE_`
- Nunca usar a chave `service_role` no frontend — ela tem acesso total ao banco
- O client Supabase deve ser instanciado **uma única vez** em `src/lib/supabase.ts`
- Nunca hardcodar URLs ou chaves diretamente no código

---

## 6. Segurança — regras obrigatórias

### Autenticação

- Usar exclusivamente `supabase.auth` para login, cadastro e logout
- Método: **email + senha** (`signInWithPassword` / `signUp`)
- Todas as rotas do app (exceto `/login` e `/cadastro`) devem ser protegidas
  por um componente `<PrivateRoute>` que verifica `supabase.auth.getSession()`
- Nunca armazenar senha em `localStorage`, `sessionStorage` ou estado React
- Token de sessão é gerenciado automaticamente pelo Supabase — não manipular

### Banco de dados

- **Row Level Security (RLS) é obrigatório** em todas as tabelas
- Nenhuma tabela deve ser criada sem a política `user_own_data`:
  ```sql
  create policy "user_own_data" on <tabela>
    for all using (auth.uid() = user_id);
  ```
- Nunca desativar RLS em ambiente de produção
- Toda query deve usar o client `supabase` autenticado — nunca o `service_role`
- Validar e sanitizar inputs antes de enviar ao banco

### Dados sensíveis

- Dados financeiros são **privados** — nunca logar valores no console em produção
- Nunca expor `user_id` ou dados de outro usuário no frontend
- Não usar serviços de analytics que transmitam dados financeiros a terceiros
- Em desenvolvimento, usar dados fictícios — nunca dados reais de produção

### Variáveis e segredos

- `.env.local` no `.gitignore` — conferir antes de qualquer commit
- Nunca commitar chaves de API, mesmo que pareçam inativas
- Se uma chave vazar acidentalmente, revogar imediatamente no painel do Supabase

---

## 7. Convenções de código

- **TypeScript estrito** — `strict: true` no tsconfig, sem `any`
- Componentes funcionais com hooks — sem class components
- Queries Supabase sempre dentro de custom hooks em `src/hooks/`
- Tratar `loading`, `error` e estado vazio em toda query
- Valores monetários como `number` no JS — nunca `string`
- Datas em ISO 8601: `YYYY-MM-DD` (dia) ou `YYYY-MM` (mês)
- Comentários em **português**
- Nomes de variáveis, funções e componentes em **inglês** (padrão do ecossistema)

---

## 8. Formatação e moeda

Sempre usar `Intl.NumberFormat` com locale `pt-BR` e currency `BRL`.
Nunca formatar moeda manualmente com replace ou concatenação.

```ts
// src/utils/format.ts — única fonte de verdade para formatação
export const fmtBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
```

---

## 9. Git — o que nunca commitar

Confirmar que o `.gitignore` da raiz contém ao menos:

```
# Ambiente
.env.local
.env.*.local
*.local

# Dependências
node_modules/

# Build
dist/
build/

# Sistema
.DS_Store
Thumbs.db
```

---

## 10. Referências

- Especificação completa do app (módulos, banco, componentes): `SKILL.md`
- Documentação Supabase: https://supabase.com/docs
- Documentação Vite: https://vitejs.dev/guide
