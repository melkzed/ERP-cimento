import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { FinancialStatus, InvoiceStatus, SaleStatus } from "@/types/erp";

type Status = SaleStatus | InvoiceStatus | FinancialStatus | "ativo" | "inativo";

const statusLabels: Record<Status, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  orcamento: "Orcamento",
  pedido: "Pedido",
  estoque: "Estoque",
  faturamento: "Faturamento",
  nf_emitida: "NF emitida",
  entrega: "Entrega",
  concluida: "Concluida",
  cancelada: "Cancelada",
  rascunho: "Rascunho",
  pendente: "Pendente",
  autorizado: "Autorizado",
  cancelado: "Cancelado",
  aberto: "Aberto",
  vencido: "Vencido",
  pago: "Pago"
};

const statusVariants: Record<Status, BadgeProps["variant"]> = {
  ativo: "success",
  inativo: "muted",
  orcamento: "outline",
  pedido: "info",
  estoque: "warning",
  faturamento: "warning",
  nf_emitida: "info",
  entrega: "info",
  concluida: "success",
  cancelada: "danger",
  rascunho: "outline",
  pendente: "warning",
  autorizado: "success",
  cancelado: "danger",
  aberto: "info",
  vencido: "danger",
  pago: "success"
};

export function StatusBadge({ status }: { status: Status }) {
  return <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>;
}
