import {
  AlertTriangle,
  Boxes,
  FileClock,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatusBadge } from "@/components/domain/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useErpData } from "@/hooks/useErpData";
import { formatCurrency } from "@/lib/utils";

const chartColors = ["#0f766e", "#f2b705", "#d95f43", "#2563eb", "#7c3aed"];

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useErpData();

  if (isLoading || !data) {
    return <Loader />;
  }

  const businessDate = [...data.sales].sort((a, b) => b.date.localeCompare(a.date))[0]?.date;
  const salesToday = data.sales.filter((sale) => sale.date === businessDate);
  const revenueToday = salesToday.reduce((total, sale) => total + sale.total, 0);
  const lowStock = data.products.filter((product) => product.stock_current <= product.stock_min);
  const pendingInvoices = data.invoices.filter((invoice) =>
    ["rascunho", "pendente"].includes(invoice.status)
  );
  const overdueEntries = data.financialEntries.filter((entry) => entry.status === "vencido");
  const receivables = data.financialEntries
    .filter((entry) => entry.type === "receber" && entry.status !== "cancelado")
    .reduce((total, entry) => total + entry.amount, 0);

  const salesByStatus = Object.entries(
    data.sales.reduce<Record<string, number>>((acc, sale) => {
      acc[sale.status] = (acc[sale.status] ?? 0) + sale.total;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const stockByCategory = Object.entries(
    data.products.reduce<Record<string, number>>((acc, product) => {
      acc[product.category] = (acc[product.category] ?? 0) + product.stock_current;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const dailySales = data.sales.map((sale) => ({
    name: sale.number.replace("PV-2026-", "PV-"),
    total: sale.total
  }));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visao executiva de vendas, estoque, fiscal e financeiro com atalhos para as pendencias."
        icon={TrendingUp}
      />
      <div className="space-y-6 p-4 lg:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Vendas do dia"
            value={formatCurrency(revenueToday)}
            helper={`${salesToday.length} pedidos em ${businessDate}`}
            icon={ShoppingCart}
            trend={14.2}
            onClick={() => navigate(`/sales?date=${businessDate}`)}
          />
          <StatCard
            label="Estoque baixo"
            value={String(lowStock.length)}
            helper="Produtos abaixo do minimo"
            icon={Boxes}
            trend={-6.5}
            onClick={() => navigate("/stock?filter=low")}
          />
          <StatCard
            label="Notas pendentes"
            value={String(pendingInvoices.length)}
            helper="Rascunhos e pendencias SEFAZ"
            icon={FileClock}
            onClick={() => navigate("/fiscal?status=pendente")}
          />
          <StatCard
            label="Contas vencidas"
            value={formatCurrency(overdueEntries.reduce((sum, entry) => sum + entry.amount, 0))}
            helper={`${overdueEntries.length} lancamentos em atraso`}
            icon={ReceiptText}
            onClick={() => navigate("/financial?status=vencido")}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailySales}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value) / 1000}k`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="total" fill="#0f766e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estoque por categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stockByCategory} dataKey="value" nameKey="name" innerRadius={64} outerRadius={104} paddingAngle={2}>
                      {stockByCategory.map((entry, index) => (
                        <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} unidades`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {stockByCategory.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-sm">
                    <span
                      className="size-3 rounded-sm"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    <span className="flex-1">{entry.name}</span>
                    <span className="font-medium">{entry.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Recebiveis monitorados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{formatCurrency(receivables)}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Soma de contas a receber abertas, pagas e vencidas no periodo carregado.
              </p>
            </CardContent>
          </Card>
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Pipeline comercial</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {salesByStatus.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => navigate(`/sales?status=${item.name}`)}
                  className="rounded-md border bg-background p-3 text-left transition hover:border-primary/40"
                >
                  <StatusBadge status={item.name as any} />
                  <p className="mt-3 text-lg font-semibold">{formatCurrency(item.value)}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {lowStock.length > 0 ? (
          <Card className="border-amber-200 bg-amber-50/70">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-5 text-amber-700" />
                <div>
                  <p className="font-medium text-amber-950">Reposicao recomendada</p>
                  <p className="text-sm text-amber-900">
                    {lowStock.map((product) => product.name).join(", ")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-amber-950 underline"
                onClick={() => navigate("/stock?filter=low")}
              >
                Abrir estoque critico
              </button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
