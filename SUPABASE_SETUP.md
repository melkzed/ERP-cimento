# Configuração do Supabase para CimentoERP

Este projeto agora usa Supabase como backend principal para dados e autenticação.

## Passo 1 — Criar projeto Supabase

1. Acesse https://supabase.com e crie um novo projeto.
2. Anote o `Project URL` e a `anon key` em `Settings > API`.
3. Preencha as variáveis de ambiente no arquivo `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Passo 2 — Criar tabelas

Use os comandos SQL abaixo diretamente no Supabase SQL Editor para criar as tabelas necessárias.

```sql
CREATE TABLE IF NOT EXISTS public.clients (
  id text PRIMARY KEY,
  type text,
  name text,
  document text,
  email text,
  phone text,
  city text,
  state text,
  address text,
  credit_limit numeric,
  current_balance numeric,
  status text,
  segment text,
  notes text,
  created_date timestamptz,
  updated_date timestamptz
);

CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text,
  sku text,
  barcode text,
  ncm text,
  cfop text,
  unit text,
  cost_price numeric,
  sale_price numeric,
  weight_kg numeric,
  category text,
  supplier text,
  stock_current integer,
  stock_min integer,
  status text,
  description text,
  created_date timestamptz,
  updated_date timestamptz
);

CREATE TABLE IF NOT EXISTS public.sales (
  id text PRIMARY KEY,
  number text,
  client_id text,
  client_name text,
  date text,
  items jsonb,
  subtotal numeric,
  freight numeric,
  discount numeric,
  total numeric,
  payment_method text,
  status text,
  carrier text,
  delivery_forecast text,
  created_date timestamptz,
  updated_date timestamptz
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id text PRIMARY KEY,
  number text,
  sale_id text,
  client_id text,
  client_name text,
  type text,
  operation text,
  issue_date text,
  total numeric,
  icms numeric,
  pis numeric,
  cofins numeric,
  ipi numeric,
  status text,
  access_key text,
  xml_url text,
  danfe_url text,
  created_date timestamptz,
  updated_date timestamptz
);

CREATE TABLE IF NOT EXISTS public.financial_entries (
  id text PRIMARY KEY,
  type text,
  description text,
  client_id text,
  sale_id text,
  invoice_id text,
  amount numeric,
  due_date text,
  payment_date text,
  status text,
  payment_method text,
  bank text,
  category text,
  created_date timestamptz,
  updated_date timestamptz
);

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id text PRIMARY KEY,
  product_id text,
  product_name text,
  type text,
  quantity numeric,
  previous_stock numeric,
  new_stock numeric,
  reason text,
  reference_id text,
  date text,
  created_date timestamptz,
  updated_date timestamptz
);
```

## Passo 3 — Testar conexão

Inicie a aplicação:

```bash
npm install
npm run dev
```

Se o Supabase estiver configurado corretamente, os dados deverão ser carregados a partir das tabelas.

## Observação

O projeto ainda mantém dados de seed locais para desenvolvimento sem conexão. Para usar Supabase, basta definir as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
