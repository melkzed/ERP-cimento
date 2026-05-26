import { BarChart3, Download } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { DataTable } from "@/components/domain/DataTable";
import { PageHeader } from "@/components/domain/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/contexts/ToastContext";
import { useErpData } from "@/hooks/useErpData";
import { formatCurrency } from "@/lib/utils";

export function ReportsPage() {
  const { toast } = useToast();
  const { data, isLoading } = useErpData();

  if (isLoading || !data) return <Loader />;

  const reportRows = data.products.map((product) => {
    const sold = data.sales
      .flatMap((sale) => sale.items)
      .filter((item) => item.product_id === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: product.id,
      product: product.name,
      category: product.category,
      stock: product.stock_current,
      sold,
      revenue: sold * product.sale_price
    };
  });

  const flow = data.sales.map((sale) => ({
    date: sale.date.slice(5),
    vendas: sale.total,
    financeiro: data.financialEntries
      .filter((entry) => entry.sale_id === sale.id)
      .reduce((sum, entry) => sum + entry.amount, 0)
  }));

  return (
    <div>
      <PageHeader
        title="Relatorios"
        description="Analises comerciais, operacionais e financeiras com filtros prontos para evolucao."
        icon={BarChart3}
        action={{
          label: "Exportar",
          icon: Download,
          onClick: () =>
            toast({
              title: "Exportacao preparada",
              description: "A camada de relatorios esta pronta para conectar XLSX/PDF.",
              variant: "success"
            })
        }}
      />
      <div className="space-y-6 p-4 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas e financeiro por periodo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={flow}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value) / 1000}k`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area type="monotone" dataKey="vendas" stroke="#0f766e" fill="url(#salesGradient)" />
                  <Area type="monotone" dataKey="financeiro" stroke="#d95f43" fill="#d95f4320" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>BI de produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={reportRows}
              keyExtractor={(row) => row.id}
              columns={[
                { header: "Produto", cell: (row) => row.product },
                { header: "Categoria", cell: (row) => row.category },
                { header: "Estoque", cell: (row) => row.stock },
                { header: "Vendido", cell: (row) => row.sold },
                { header: "Receita estimada", cell: (row) => formatCurrency(row.revenue) }
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
