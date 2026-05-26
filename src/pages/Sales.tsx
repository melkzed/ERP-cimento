import * as React from "react";
import {
  Banknote,
  FileCheck2,
  PackageCheck,
  Plus,
  Search,
  ShoppingCart,
  Truck
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { DataTable } from "@/components/domain/DataTable";
import { DetailGrid } from "@/components/domain/DetailGrid";
import { FlowPipeline } from "@/components/domain/FlowPipeline";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatusBadge } from "@/components/domain/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/contexts/ToastContext";
import { useErpData } from "@/hooks/useErpData";
import { formatCurrency, formatDate, normalize } from "@/lib/utils";
import type { Sale, SaleStatus } from "@/types/erp";

const statuses: Array<{ value: SaleStatus | "todos"; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "orcamento", label: "Orcamento" },
  { value: "pedido", label: "Pedido" },
  { value: "estoque", label: "Estoque" },
  { value: "faturamento", label: "Faturamento" },
  { value: "nf_emitida", label: "NF emitida" },
  { value: "entrega", label: "Entrega" },
  { value: "concluida", label: "Concluida" }
];

export function SalesPage() {
  const { data, isLoading } = useErpData();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<string>(params.get("status") ?? "todos");
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isLoading || !data) return <Loader />;

  const filteredSales = data.sales.filter((sale) => {
    const matchesStatus = status === "todos" || sale.status === status;
    const matchesClient = !params.get("client") || sale.client_id === params.get("client");
    const matchesDate = !params.get("date") || sale.date === params.get("date");
    const matchesProduct =
      !params.get("product") ||
      sale.items.some((item) => item.product_id === params.get("product"));
    const matchesQuery = normalize(`${sale.number} ${sale.client_name} ${sale.status}`).includes(
      normalize(query)
    );

    return matchesStatus && matchesClient && matchesDate && matchesProduct && matchesQuery;
  });

  const selectedSale =
    filteredSales.find((sale) => sale.id === params.get("sale")) ??
    filteredSales[0] ??
    data.sales[0];

  const invoice = data.invoices.find((item) => item.sale_id === selectedSale.id);
  const financial = data.financialEntries.filter((entry) => entry.sale_id === selectedSale.id);

  function selectSale(sale: Sale) {
    setParams((current) => {
      current.set("sale", sale.id);
      return current;
    });
  }

  return (
    <div>
      <PageHeader
        title="Vendas"
        description="Pedidos, itens, estoque, fiscal, entrega, financeiro e historico operacional conectados."
        icon={ShoppingCart}
        action={{
          label: "Nova venda",
          icon: Plus,
          onClick: () =>
            toast({
              title: "Nova venda",
              description: "Fluxo pronto para gravar com Sale.create() e reservar estoque.",
              variant: "success"
            })
        }}
      />
      <div className="grid gap-4 p-4 lg:grid-cols-[430px_1fr] lg:p-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-[1fr_150px] lg:grid-cols-1 xl:grid-cols-[1fr_150px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="pl-9"
                  placeholder="Buscar pedido ou cliente"
                />
              </div>
              <Select value={status} onChange={(event) => setStatus(event.target.value)}>
                {statuses.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>
            <DataTable
              data={filteredSales}
              keyExtractor={(sale) => sale.id}
              selectedId={selectedSale.id}
              onRowClick={selectSale}
              columns={[
                {
                  header: "Pedido",
                  cell: (sale) => (
                    <div>
                      <p className="font-medium">{sale.number}</p>
                      <p className="text-xs text-muted-foreground">{sale.client_name}</p>
                    </div>
                  )
                },
                {
                  header: "Total",
                  cell: (sale) => formatCurrency(sale.total),
                  className: "w-28"
                }
              ]}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-5 p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">{selectedSale.number}</h2>
                    <StatusBadge status={selectedSale.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedSale.client_name}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => navigate(`/fiscal?sale=${selectedSale.id}&action=issue`)}>
                    <FileCheck2 className="size-4" />
                    Gerar NF-e
                  </Button>
                  <Button variant="outline" onClick={() => navigate(`/stock?sale=${selectedSale.id}&action=reserve`)}>
                    <PackageCheck className="size-4" />
                    Reservar
                  </Button>
                  <Button variant="outline" onClick={() => navigate(`/financial?sale=${selectedSale.id}&action=receive`)}>
                    <Banknote className="size-4" />
                    Recebimento
                  </Button>
                </div>
              </div>
              <FlowPipeline status={selectedSale.status} />
            </CardContent>
          </Card>

          <Tabs
            tabs={[
              {
                value: "pedido",
                label: "Dados do pedido",
                content: (
                  <DetailGrid
                    items={[
                      { label: "Cliente", value: selectedSale.client_name },
                      { label: "Data", value: formatDate(selectedSale.date) },
                      { label: "Subtotal", value: formatCurrency(selectedSale.subtotal) },
                      { label: "Frete", value: formatCurrency(selectedSale.freight) },
                      { label: "Desconto", value: formatCurrency(selectedSale.discount) },
                      { label: "Total", value: formatCurrency(selectedSale.total) },
                      { label: "Pagamento", value: selectedSale.payment_method },
                      { label: "Transportadora", value: selectedSale.carrier ?? "Pendente" },
                      { label: "Previsao", value: selectedSale.delivery_forecast ? formatDate(selectedSale.delivery_forecast) : "Pendente" }
                    ]}
                  />
                )
              },
              {
                value: "itens",
                label: "Itens",
                content: (
                  <DataTable
                    data={selectedSale.items}
                    keyExtractor={(item) => item.product_id}
                    columns={[
                      { header: "Produto", cell: (item) => item.product_name },
                      { header: "Quantidade", cell: (item) => item.quantity },
                      { header: "Unitario", cell: (item) => formatCurrency(item.unit_price) },
                      { header: "Desconto", cell: (item) => formatCurrency(item.discount) },
                      { header: "Total", cell: (item) => formatCurrency(item.quantity * item.unit_price - item.discount) }
                    ]}
                  />
                )
              },
              {
                value: "estoque",
                label: "Situacao do estoque",
                content: (
                  <DataTable
                    data={selectedSale.items.map((item) => {
                      const product = data.products.find((candidate) => candidate.id === item.product_id);
                      return {
                        ...item,
                        current: product?.stock_current ?? 0,
                        min: product?.stock_min ?? 0,
                        enough: (product?.stock_current ?? 0) >= item.quantity
                      };
                    })}
                    keyExtractor={(item) => item.product_id}
                    columns={[
                      { header: "Produto", cell: (item) => item.product_name },
                      { header: "Pedido", cell: (item) => item.quantity },
                      { header: "Estoque atual", cell: (item) => item.current },
                      { header: "Minimo", cell: (item) => item.min },
                      { header: "Situacao", cell: (item) => (item.enough ? "Disponivel" : "Comprar") }
                    ]}
                  />
                )
              },
              {
                value: "fiscal",
                label: "Dados fiscais",
                content: invoice ? (
                  <DetailGrid
                    items={[
                      { label: "Nota", value: invoice.number },
                      { label: "Tipo", value: invoice.type },
                      { label: "Status", value: <StatusBadge status={invoice.status} /> },
                      { label: "ICMS", value: formatCurrency(invoice.icms) },
                      { label: "PIS", value: formatCurrency(invoice.pis) },
                      { label: "COFINS", value: formatCurrency(invoice.cofins) }
                    ]}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-4 text-sm text-muted-foreground">
                      Nenhuma nota fiscal vinculada a este pedido.
                    </CardContent>
                  </Card>
                )
              },
              {
                value: "entrega",
                label: "Entrega",
                content: (
                  <DetailGrid
                    items={[
                      { label: "Transportadora", value: selectedSale.carrier ?? "Pendente" },
                      { label: "Previsao", value: selectedSale.delivery_forecast ? formatDate(selectedSale.delivery_forecast) : "Pendente" },
                      { label: "Status", value: selectedSale.status === "entrega" ? "Em andamento" : "Aguardando etapa" },
                      { label: "Contato", value: "logistica@cimentoerp.local" }
                    ]}
                  />
                )
              },
              {
                value: "financeiro",
                label: "Financeiro",
                content: (
                  <DataTable
                    data={financial}
                    keyExtractor={(entry) => entry.id}
                    onRowClick={(entry) => navigate(`/financial?entry=${entry.id}`)}
                    columns={[
                      { header: "Descricao", cell: (entry) => entry.description },
                      { header: "Vencimento", cell: (entry) => formatDate(entry.due_date) },
                      { header: "Valor", cell: (entry) => formatCurrency(entry.amount) },
                      { header: "Status", cell: (entry) => <StatusBadge status={entry.status} /> }
                    ]}
                  />
                )
              },
              {
                value: "historico",
                label: "Historico",
                content: (
                  <div className="space-y-3">
                    {["Pedido criado", "Estoque verificado", "Financeiro conferido"].map((item, index) => (
                      <div key={item} className="flex items-center gap-3 rounded-md border bg-card p-3">
                        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                )
              }
            ]}
          />

          <Card>
            <CardContent className="flex flex-wrap gap-2 p-4">
              <Button variant="outline" onClick={() => navigate(`/sales?sale=${selectedSale.id}&action=carrier`)}>
                <Truck className="size-4" />
                Escolher transportadora
              </Button>
              <Button variant="outline" onClick={() => navigate(`/sales?sale=${selectedSale.id}&action=track`)}>
                <Truck className="size-4" />
                Acompanhar entrega
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
