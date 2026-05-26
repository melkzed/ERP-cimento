import * as React from "react";
import {
  Banknote,
  FileText,
  Plus,
  Search,
  ShoppingCart,
  Truck,
  UserRound
} from "lucide-react";
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
import type { Client } from "@/types/erp";

export function ClientsPage() {
  const { data, isLoading } = useErpData();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = React.useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isLoading || !data) return <Loader />;

  const filteredClients = data.clients.filter((client) =>
    normalize(`${client.name} ${client.document} ${client.city} ${client.segment}`).includes(
      normalize(query)
    )
  );
  const selectedClient =
    filteredClients.find((client) => client.id === params.get("client")) ??
    filteredClients[0] ??
    data.clients[0];

  const clientSales = data.sales.filter((sale) => sale.client_id === selectedClient?.id);
  const clientInvoices = data.invoices.filter((invoice) => invoice.client_id === selectedClient?.id);
  const clientFinancial = data.financialEntries.filter(
    (entry) => entry.client_id === selectedClient?.id
  );

  function selectClient(client: Client) {
    setParams((current) => {
      current.set("client", client.id);
      return current;
    });
  }

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Cadastro, historico comercial, notas, financeiro e entregas do cliente em uma tela unica."
        icon={UserRound}
        action={{
          label: "Novo cliente",
          icon: Plus,
          onClick: () =>
            toast({
              title: "Novo cliente",
              description: "Formulario pronto para conectar ao Client.create() no Supabase.",
              variant: "success"
            })
        }}
      />

      <div className="grid gap-4 p-4 lg:grid-cols-[380px_1fr] lg:p-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Lista de clientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-9"
                placeholder="Buscar por nome, CNPJ, cidade"
              />
            </div>
            <DataTable
              data={filteredClients}
              keyExtractor={(client) => client.id}
              selectedId={selectedClient?.id}
              onRowClick={selectClient}
              columns={[
                {
                  header: "Cliente",
                  cell: (client) => (
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.document}</p>
                    </div>
                  )
                },
                {
                  header: "Status",
                  cell: (client) => <StatusBadge status={client.status} />,
                  className: "w-24"
                }
              ]}
            />
          </CardContent>
        </Card>

        {selectedClient ? (
          <div className="space-y-4">
            <Card>
              <CardContent className="flex flex-col gap-4 p-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">{selectedClient.name}</h2>
                    <StatusBadge status={selectedClient.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedClient.segment} - {selectedClient.city}/{selectedClient.state}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => navigate(`/sales?client=${selectedClient.id}&action=new`)}>
                    <ShoppingCart className="size-4" />
                    Nova venda
                  </Button>
                  <Button variant="outline" onClick={() => navigate(`/fiscal?client=${selectedClient.id}`)}>
                    <FileText className="size-4" />
                    Notas
                  </Button>
                  <Button variant="outline" onClick={() => navigate(`/financial?client=${selectedClient.id}`)}>
                    <Banknote className="size-4" />
                    Financeiro
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Tabs
              tabs={[
                {
                  value: "dados",
                  label: "Dados cadastrais",
                  content: (
                    <DetailGrid
                      items={[
                        { label: "Tipo", value: selectedClient.type },
                        { label: "Documento", value: selectedClient.document },
                        { label: "E-mail", value: selectedClient.email },
                        { label: "Telefone", value: selectedClient.phone },
                        { label: "Endereco", value: selectedClient.address },
                        { label: "Limite de credito", value: formatCurrency(selectedClient.credit_limit) },
                        { label: "Saldo atual", value: formatCurrency(selectedClient.current_balance) },
                        { label: "Observacoes", value: selectedClient.notes ?? "Sem observacoes" }
                      ]}
                    />
                  )
                },
                {
                  value: "vendas",
                  label: "Historico de vendas",
                  content: (
                    <DataTable
                      data={clientSales}
                      keyExtractor={(sale) => sale.id}
                      onRowClick={(sale) => navigate(`/sales?sale=${sale.id}`)}
                      columns={[
                        { header: "Pedido", cell: (sale) => sale.number },
                        { header: "Data", cell: (sale) => formatDate(sale.date) },
                        { header: "Total", cell: (sale) => formatCurrency(sale.total) },
                        { header: "Status", cell: (sale) => <StatusBadge status={sale.status} /> }
                      ]}
                    />
                  )
                },
                {
                  value: "notas",
                  label: "Notas fiscais",
                  content: (
                    <DataTable
                      data={clientInvoices}
                      keyExtractor={(invoice) => invoice.id}
                      onRowClick={(invoice) => navigate(`/fiscal?invoice=${invoice.id}`)}
                      columns={[
                        { header: "Numero", cell: (invoice) => invoice.number },
                        { header: "Emissao", cell: (invoice) => formatDate(invoice.issue_date) },
                        { header: "Valor", cell: (invoice) => formatCurrency(invoice.total) },
                        { header: "Status", cell: (invoice) => <StatusBadge status={invoice.status} /> }
                      ]}
                    />
                  )
                },
                {
                  value: "financeiro",
                  label: "Dados financeiros",
                  content: (
                    <DataTable
                      data={clientFinancial}
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
                  value: "entregas",
                  label: "Entregas",
                  content: (
                    <div className="grid gap-3">
                      {clientSales.map((sale) => (
                        <button
                          type="button"
                          key={sale.id}
                          onClick={() => navigate(`/sales?sale=${sale.id}`)}
                          className="flex items-center justify-between rounded-md border bg-card p-3 text-left hover:bg-muted"
                        >
                          <span className="flex items-center gap-3">
                            <Truck className="size-4 text-primary" />
                            <span>
                              <span className="block text-sm font-medium">{sale.number}</span>
                              <span className="block text-xs text-muted-foreground">
                                {sale.carrier ?? "Transportadora pendente"}
                              </span>
                            </span>
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {sale.delivery_forecast ? formatDate(sale.delivery_forecast) : "Sem previsao"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )
                },
                {
                  value: "observacoes",
                  label: "Observacoes",
                  content: (
                    <Card>
                      <CardContent className="p-4 text-sm text-muted-foreground">
                        {selectedClient.notes ?? "Nenhuma observacao cadastrada para este cliente."}
                      </CardContent>
                    </Card>
                  )
                }
              ]}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
