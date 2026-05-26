export type EntityStatus = "ativo" | "inativo";
export type ClientType = "PF" | "PJ";
export type SaleStatus =
  | "orcamento"
  | "pedido"
  | "estoque"
  | "faturamento"
  | "nf_emitida"
  | "entrega"
  | "concluida"
  | "cancelada";
export type InvoiceStatus = "rascunho" | "pendente" | "autorizado" | "cancelado";
export type FinancialStatus = "aberto" | "vencido" | "pago" | "cancelado";
export type FinancialType = "receber" | "pagar";
export type StockMovementType = "entrada" | "saida" | "ajuste" | "reserva";

export interface EntityBase {
  id: string;
  created_date?: string;
  updated_date?: string;
}

export interface Client extends EntityBase {
  type: ClientType;
  name: string;
  document: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  address: string;
  credit_limit: number;
  current_balance: number;
  status: EntityStatus;
  segment: string;
  notes?: string;
}

export interface Product extends EntityBase {
  name: string;
  sku: string;
  barcode: string;
  ncm: string;
  cfop: string;
  unit: string;
  cost_price: number;
  sale_price: number;
  weight_kg: number;
  category: string;
  supplier: string;
  stock_current: number;
  stock_min: number;
  status: EntityStatus;
  description: string;
}

export interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
}

export interface Sale extends EntityBase {
  number: string;
  client_id: string;
  client_name: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  freight: number;
  discount: number;
  total: number;
  payment_method: string;
  status: SaleStatus;
  carrier?: string;
  delivery_forecast?: string;
}

export interface Invoice extends EntityBase {
  number: string;
  sale_id: string;
  client_id: string;
  client_name: string;
  type: "NFe" | "NFCe" | "NFSe";
  operation: string;
  issue_date: string;
  total: number;
  icms: number;
  pis: number;
  cofins: number;
  ipi: number;
  status: InvoiceStatus;
  access_key?: string;
  xml_url?: string;
  danfe_url?: string;
}

export interface FinancialEntry extends EntityBase {
  type: FinancialType;
  description: string;
  client_id?: string;
  sale_id?: string;
  invoice_id?: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: FinancialStatus;
  payment_method: string;
  bank: string;
  category: string;
}

export interface StockMovement extends EntityBase {
  product_id: string;
  product_name: string;
  type: StockMovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  reference_id?: string;
  date: string;
}

export interface ErpData {
  clients: Client[];
  products: Product[];
  sales: Sale[];
  invoices: Invoice[];
  financialEntries: FinancialEntry[];
  stockMovements: StockMovement[];
}

export interface DashboardMetric {
  label: string;
  value: string;
  helper: string;
  trend?: number;
}

export type Role = "admin" | "fiscal" | "financeiro" | "vendas" | "estoque";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  company: string;
}
