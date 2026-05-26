import {
  AlertTriangle,
  Banknote,
  Boxes,
  ClipboardList,
  FileClock,
  PackageCheck,
  Truck
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components/domain/PageHeader";
import { StatusBadge } from "@/components/domain/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useErpData } from "@/hooks/useErpData";
import { formatCurrency } from "@/lib/utils";

export function OperationalCenterPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useErpData();

  if (isLoading || !data) return <Loader />;

  const openSales = data.sales.filter((sale) => !["concluida", "cancelada"].includes(sale.status));
  const pendingInvoices = data.invoices.filter((invoice) => ["rascunho", "pendente"].includes(invoice.status));
  const criticalStock = data.products.filter((product) => product.stock_current <= product.stock_min);
  const deliveries = data.sales.filter((sale) => sale.status === "entrega");
  const receivables = data.financialEntries.filter((entry) => entry.type === "receber" && entry.status !== "pago");
  const payables = data.financialEntries.filter((entry) => entry.type === "pagar" && entry.status !== "pago");
  const daySales = data.sales.filter((sale) => sale.date === "2026-05-21");

  const cards = [
    { label: "Pedidos em aberto", value: openSales.length, icon: ClipboardList, to: "/sales" },
    { label: "Notas pendentes", value: pendingInvoices.length, icon: FileClock, to: "/fiscal?status=pendente" },
    { label: "Estoque critico", value: criticalStock.length, icon: Boxes, to: "/stock?filter=low" },
    { label: "Entregas", value: deliveries.length, icon: Truck, to: "/sales?status=entrega" },
    { label: "A receber", value: formatCurrency(receivables.reduce((sum, entry) => sum + entry.amount, 0)), icon: Banknote, to: "/financial?type=receber" },
    { label: "A pagar", value: formatCurrency(payables.reduce((sum, entry) => sum + entry.amount, 0)), icon: Banknote, to: "/financial?type=pagar" },
    { label: "Vendas do dia", value: formatCurrency(daySales.reduce((sum, sale) => sum + sale.total, 0)), icon: PackageCheck, to: "/sales?date=2026-05-21" }
  ];

  return (
    <div>
      <PageHeader
        title="Central Operacional"
        description="Painel de acompanhamento em tempo real para pedidos, fiscal, estoque, entregas e financeiro."
        icon={ClipboardList}
      />
      <div className="space-y-6 p-4 lg:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <button
              key={card.label}
              type="button"
              onClick={() => navigate(card.to)}
              className="text-left"
            >
              <Card className="h-full transition hover:border-primary/40">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{card.label}</p>
                      <p className="mt-2 text-2xl font-semibold">{card.value}</p>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-md bg-muted text-primary">
                      <card.icon className="size-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos em aberto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {openSales.map((sale) => (
                <button
                  key={sale.id}
                  type="button"
                  onClick={() => navigate(`/sales?sale=${sale.id}`)}
                  className="flex w-full items-center justify-between gap-3 rounded-md border p-3 text-left hover:bg-muted"
                >
                  <span>
                    <span className="block text-sm font-medium">{sale.number}</span>
                    <span className="block text-xs text-muted-foreground">{sale.client_name}</span>
                  </span>
                  <StatusBadge status={sale.status} />
                </button>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Alertas fiscais e bancarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...pendingInvoices, ...data.financialEntries.filter((entry) => entry.status === "vencido")].map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-md border p-3">
                  <AlertTriangle className="mt-0.5 size-4 text-amber-700" />
                  <div>
                    <p className="text-sm font-medium">{"number" in item ? item.number : item.description}</p>
                    <p className="text-xs text-muted-foreground">{"status" in item ? item.status : ""}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pendencias por setor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ["Comercial", openSales.length],
                ["Fiscal", pendingInvoices.length],
                ["Estoque", criticalStock.length],
                ["Financeiro", receivables.length + payables.length]
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-lg font-semibold">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
