import * as React from "react";
import { Download, FileText, Plus, RefreshCw, Search, XCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { DataTable } from "@/components/domain/DataTable";
import { DetailGrid } from "@/components/domain/DetailGrid";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatusBadge } from "@/components/domain/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/contexts/ToastContext";
import { useErpData } from "@/hooks/useErpData";
import { formatCurrency, formatDate, normalize } from "@/lib/utils";
import type { Invoice } from "@/types/erp";

export function FiscalPage() {
  const { data, isLoading } = useErpData();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = React.useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isLoading || !data) return <Loader />;

  const statusFilter = params.get("status");
  const filteredInvoices = data.invoices.filter((invoice) => {
    const matchesStatus =
      !statusFilter ||
      invoice.status === statusFilter ||
      (statusFilter === "pendente" && ["rascunho", "pendente"].includes(invoice.status));
    const matchesClient = !params.get("client") || invoice.client_id === params.get("client");
    const matchesSale = !params.get("sale") || invoice.sale_id === params.get("sale");
    const matchesQuery = normalize(`${invoice.number} ${invoice.client_name} ${invoice.access_key ?? ""}`).includes(
      normalize(query)
    );
    return matchesStatus && matchesClient && matchesSale && matchesQuery;
  });

  const selectedInvoice =
    filteredInvoices.find((invoice) => invoice.id === params.get("invoice")) ??
    filteredInvoices[0] ??
    data.invoices[0];
  const sale = data.sales.find((item) => item.id === selectedInvoice.sale_id);
  const products = sale?.items ?? [];

  function selectInvoice(invoice: Invoice) {
    setParams((current) => {
      current.set("invoice", invoice.id);
      return current;
    });
  }

  function action(title: string) {
    toast({
      title,
      description: "Acao fiscal preparada para integrar com SEFAZ e arquivos fiscais.",
      variant: "success"
    });
  }

  return (
    <div>
      <PageHeader
        title="Fiscal"
        description="Emissao, consulta SEFAZ, impostos, XML, DANFE, cancelamento e financeiro fiscal."
        icon={FileText}
        action={{ label: "Nova nota", icon: Plus, onClick: () => action("Nova nota fiscal") }}
      />
      <div className="grid gap-4 p-4 lg:grid-cols-[430px_1fr] lg:p-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Notas fiscais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-9"
                placeholder="Buscar NF, cliente ou chave"
              />
            </div>
            <DataTable
              data={filteredInvoices}
              keyExtractor={(invoice) => invoice.id}
              selectedId={selectedInvoice.id}
              onRowClick={selectInvoice}
              columns={[
                {
                  header: "Nota",
                  cell: (invoice) => (
                    <div>
                      <p className="font-medium">{invoice.number}</p>
                      <p className="text-xs text-muted-foreground">{invoice.client_name}</p>
                    </div>
                  )
                },
                { header: "Status", cell: (invoice) => <StatusBadge status={invoice.status} /> }
              ]}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-col gap-4 p-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold">{selectedInvoice.number}</h2>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{selectedInvoice.client_name}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => action("DANFE emitido")}>
                  <Download className="size-4" />
                  DANFE
                </Button>
                <Button variant="outline" onClick={() => action("XML baixado")}>
                  <Download className="size-4" />
                  XML
                </Button>
                <Button variant="outline" onClick={() => action("Consulta SEFAZ")}>
                  <RefreshCw className="size-4" />
                  SEFAZ
                </Button>
                <Button variant="outline" onClick={() => action("Cancelamento fiscal")}>
                  <XCircle className="size-4" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs
            tabs={[
              {
                value: "dados",
                label: "Dados fiscais",
                content: (
                  <DetailGrid
                    items={[
                      { label: "Tipo", value: selectedInvoice.type },
                      { label: "Operacao", value: selectedInvoice.operation },
                      { label: "Emissao", value: formatDate(selectedInvoice.issue_date) },
                      { label: "Total", value: formatCurrency(selectedInvoice.total) },
                      { label: "Chave", value: selectedInvoice.access_key ?? "Aguardando autorizacao" },
                      { label: "Pedido", value: sale?.number ?? "Nao vinculado" }
                    ]}
                  />
                )
              },
              {
                value: "produtos",
                label: "Produtos e servicos",
                content: (
                  <DataTable
                    data={products}
                    keyExtractor={(item) => item.product_id}
                    columns={[
                      { header: "Produto", cell: (item) => item.product_name },
                      { header: "Quantidade", cell: (item) => item.quantity },
                      { header: "Unitario", cell: (item) => formatCurrency(item.unit_price) },
                      { header: "Total", cell: (item) => formatCurrency(item.quantity * item.unit_price - item.discount) }
                    ]}
                  />
                )
              },
              {
                value: "impostos",
                label: "Impostos",
                content: (
                  <DetailGrid
                    items={[
                      { label: "ICMS", value: formatCurrency(selectedInvoice.icms) },
                      { label: "PIS", value: formatCurrency(selectedInvoice.pis) },
                      { label: "COFINS", value: formatCurrency(selectedInvoice.cofins) },
                      { label: "IPI", value: formatCurrency(selectedInvoice.ipi) },
                      { label: "Carga tributaria", value: `${(((selectedInvoice.icms + selectedInvoice.pis + selectedInvoice.cofins + selectedInvoice.ipi) / selectedInvoice.total) * 100).toFixed(2)}%` },
                      { label: "Regime", value: "Lucro presumido" }
                    ]}
                  />
                )
              },
              {
                value: "transporte",
                label: "Transporte",
                content: (
                  <DetailGrid
                    items={[
                      { label: "Transportadora", value: sale?.carrier ?? "Pendente" },
                      { label: "Frete", value: sale ? formatCurrency(sale.freight) : "Pendente" },
                      { label: "Previsao", value: sale?.delivery_forecast ? formatDate(sale.delivery_forecast) : "Pendente" }
                    ]}
                  />
                )
              },
              {
                value: "pagamento",
                label: "Pagamento",
                content: (
                  <DetailGrid
                    items={[
                      { label: "Forma", value: sale?.payment_method ?? "Pendente" },
                      { label: "Total", value: formatCurrency(selectedInvoice.total) },
                      { label: "Financeiro", value: "Geravel a partir da nota" }
                    ]}
                  />
                )
              },
              {
                value: "xml",
                label: "XML/DANFE",
                content: (
                  <DetailGrid
                    items={[
                      { label: "XML", value: selectedInvoice.xml_url ?? "Nao gerado" },
                      { label: "DANFE", value: selectedInvoice.danfe_url ?? "Nao gerado" },
                      { label: "Carta de correcao", value: "Disponivel apos autorizacao" }
                    ]}
                  />
                )
              },
              {
                value: "historico",
                label: "Historico SEFAZ",
                content: (
                  <div className="space-y-3">
                    {["Nota criada", "Impostos calculados", "Aguardando retorno SEFAZ"].map((item) => (
                      <div key={item} className="rounded-md border bg-card p-3 text-sm font-medium">
                        {item}
                      </div>
                    ))}
                  </div>
                )
              }
            ]}
          />

          <Card>
            <CardContent className="flex flex-wrap gap-2 p-4">
              <Button variant="outline" onClick={() => action("Carta de correcao")}>Carta de correcao</Button>
              <Button variant="outline" onClick={() => navigate(`/financial?invoice=${selectedInvoice.id}&action=generate`)}>
                Gerar financeiro
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
