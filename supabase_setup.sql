-- Supabase schema for CimentoERP

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
