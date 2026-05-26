import * as React from "react";
import { Banknote, Building2, FileText, Plus, Search, ShoppingCart } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { DataTable } from "@/components/domain/DataTable";
import { DetailGrid } from "@/components/domain/DetailGrid";
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
import type { FinancialEntry, FinancialStatus, FinancialType } from "@/types/erp";

export function FinancialPage() {
  const { data, isLoading } = useErpData();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = React.useState("");
  const [type, setType] = React.useState<FinancialType | "todos">(
    (params.get("type") as FinancialType) ?? "todos"
  );
  const [status, setStatus] = React.useState<FinancialStatus | "todos">(
    (params.get("status") as FinancialStatus) ?? "todos"
  );
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isLoading || !data) return <Loader />;

  const filteredEntries = data.financialEntries.filter((entry) => {
    const matchesType = type === "todos" || entry.type === type;
    const matchesStatus = status === "todos" || entry.status === status;
    const matchesClient = !params.get("client") || entry.client_id === params.get("client");
    const matchesSale = !params.get("sale") || entry.sale_id === params.get("sale");
    const matchesInvoice = !params.get("invoice") || entry.invoice_id === params.get("invoice");
    const matchesQuery = normalize(`${entry.description} ${entry.bank} ${entry.category}`).includes(
      normalize(query)
    );
    return matchesType && matchesStatus && matchesClient && matchesSale && matchesInvoice && matchesQuery;
  });

  const selectedEntry =
    filteredEntries.find((entry) => entry.id === params.get("entry")) ??
    filteredEntries[0] ??
    data.financialEntries[0];
  const client = data.clients.find((item) => item.id === selectedEntry.client_id);
  const sale = data.sales.find((item) => item.id === selectedEntry.sale_id);
  const invoice = data.invoices.find((item) => item.id === selectedEntry.invoice_id);

  const totals = data.financialEntries.reduce(
    (acc, entry) => {
      if (entry.type === "receber") acc.receber += entry.amount;
      if (entry.type === "pagar") acc.pagar += entry.amount;
      if (entry.status === "vencido") acc.vencido += entry.amount;
      if (entry.status === "pago") acc.pago += entry.amount;
      return acc;
    },
    { receber: 0, pagar: 0, vencido: 0, pago: 0 }
  );

  function selectEntry(entry: FinancialEntry) {
    setParams((current) => {
      current.set("entry", entry.id);
      return current;
    });
  }

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Contas a receber, contas a pagar, bancos, baixas e vinculos com cliente, venda e nota fiscal."
        icon={Banknote}
        action={{
          label: "Novo lancamento",
          icon: Plus,
          onClick: () =>
            toast({
              title: "Novo lancamento",
              description: "Fluxo pronto para FinancialEntry.create() no Supabase.",
              variant: "success"
            })
        }}
      />

      <div className="space-y-4 p-4 lg:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["A receber", totals.receber],
            ["A pagar", totals.pagar],
            ["Vencido", totals.vencido],
            ["Pago", totals.pago]
          ].map(([label, value]) => (
            <Card key={label}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-semibold">{formatCurrency(Number(value))}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[460px_1fr]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Lancamentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div className="relative sm:col-span-3 lg:col-span-1 xl:col-span-3">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="pl-9"
                    placeholder="Buscar financeiro"
                  />
                </div>
                <Select value={type} onChange={(event) => setType(event.target.value as FinancialType | "todos")}>
                  <option value="todos">Tipo</option>
                  <option value="receber">Receber</option>
                  <option value="pagar">Pagar</option>
                </Select>
                <Select value={status} onChange={(event) => setStatus(event.target.value as FinancialStatus | "todos")}>
                  <option value="todos">Status</option>
                  <option value="aberto">Aberto</option>
                  <option value="vencido">Vencido</option>
                  <option value="pago">Pago</option>
                  <option value="cancelado">Cancelado</option>
                </Select>
              </div>
              <DataTable
                data={filteredEntries}
                keyExtractor={(entry) => entry.id}
                selectedId={selectedEntry.id}
                onRowClick={selectEntry}
                columns={[
                  {
                    header: "Lancamento",
                    cell: (entry) => (
                      <div>
                        <p className="font-medium">{entry.description}</p>
                        <p className="text-xs text-muted-foreground">{entry.bank}</p>
                      </div>
                    )
                  },
                  {
                    header: "Valor",
                    cell: (entry) => formatCurrency(entry.amount),
                    className: "w-28"
                  }
                ]}
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardContent className="flex flex-col gap-4 p-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">{selectedEntry.description}</h2>
                    <StatusBadge status={selectedEntry.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedEntry.type === "receber" ? "Conta a receber" : "Conta a pagar"} - {selectedEntry.bank}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {client ? (
                    <Button variant="outline" onClick={() => navigate(`/clients?client=${client.id}`)}>
                      <Building2 className="size-4" />
                      Cliente
                    </Button>
                  ) : null}
                  {sale ? (
                    <Button variant="outline" onClick={() => navigate(`/sales?sale=${sale.id}`)}>
                      <ShoppingCart className="size-4" />
                      Venda
                    </Button>
                  ) : null}
                  {invoice ? (
                    <Button variant="outline" onClick={() => navigate(`/fiscal?invoice=${invoice.id}`)}>
                      <FileText className="size-4" />
                      Nota
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Tabs
              tabs={[
                {
                  value: "dados",
                  label: "Dados financeiros",
                  content: (
                    <DetailGrid
                      items={[
                        { label: "Tipo", value: selectedEntry.type },
                        { label: "Valor", value: formatCurrency(selectedEntry.amount) },
                        { label: "Vencimento", value: formatDate(selectedEntry.due_date) },
                        { label: "Pagamento", value: selectedEntry.payment_date ? formatDate(selectedEntry.payment_date) : "Pendente" },
                        { label: "Metodo", value: selectedEntry.payment_method },
                        { label: "Banco", value: selectedEntry.bank },
                        { label: "Categoria", value: selectedEntry.category },
                        { label: "Status", value: <StatusBadge status={selectedEntry.status} /> }
                      ]}
                    />
                  )
                },
                {
                  value: "vinculos",
                  label: "Vinculos",
                  content: (
                    <DetailGrid
                      items={[
                        { label: "Cliente", value: client?.name ?? "Nao vinculado" },
                        { label: "Venda", value: sale?.number ?? "Nao vinculada" },
                        { label: "Nota fiscal", value: invoice?.number ?? "Nao vinculada" },
                        { label: "Banco", value: selectedEntry.bank }
                      ]}
                    />
                  )
                },
                {
                  value: "baixa",
                  label: "Baixa e conciliacao",
                  content: (
                    <Card>
                      <CardContent className="space-y-3 p-4">
                        <p className="text-sm text-muted-foreground">
                          Lancamento pronto para baixa bancaria, conciliacao e auditoria.
                        </p>
                        <Button onClick={() => toast({ title: "Baixa preparada", variant: "success" })}>
                          Confirmar baixa
                        </Button>
                      </CardContent>
                    </Card>
                  )
                }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
