import * as React from "react";
import { Boxes, FileText, History, Package, Plus, Search, ShoppingCart } from "lucide-react";
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
import type { Product } from "@/types/erp";

export function ProductsPage() {
  const { data, isLoading } = useErpData();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = React.useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isLoading || !data) return <Loader />;

  const filteredProducts = data.products.filter((product) =>
    normalize(`${product.name} ${product.sku} ${product.category} ${product.supplier}`).includes(
      normalize(query)
    )
  );
  const selectedProduct =
    filteredProducts.find((product) => product.id === params.get("product")) ??
    filteredProducts[0] ??
    data.products[0];

  const productMovements = data.stockMovements.filter(
    (movement) => movement.product_id === selectedProduct?.id
  );
  const productSales = data.sales.filter((sale) =>
    sale.items.some((item) => item.product_id === selectedProduct?.id)
  );
  const isLowStock = selectedProduct.stock_current <= selectedProduct.stock_min;

  function selectProduct(product: Product) {
    setParams((current) => {
      current.set("product", product.id);
      return current;
    });
  }

  return (
    <div>
      <PageHeader
        title="Produtos"
        description="Catalogo com dados comerciais, fiscais, estoque, fornecedores, historico e relatorios por produto."
        icon={Package}
        action={{
          label: "Novo produto",
          icon: Plus,
          onClick: () =>
            toast({
              title: "Novo produto",
              description: "Formulario pronto para conectar ao Product.create() no Supabase.",
              variant: "success"
            })
        }}
      />
      <div className="grid gap-4 p-4 lg:grid-cols-[420px_1fr] lg:p-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Catalogo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-9"
                placeholder="Buscar por nome, SKU, categoria"
              />
            </div>
            <DataTable
              data={filteredProducts}
              keyExtractor={(product) => product.id}
              selectedId={selectedProduct?.id}
              onRowClick={selectProduct}
              columns={[
                {
                  header: "Produto",
                  cell: (product) => (
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                    </div>
                  )
                },
                {
                  header: "Estoque",
                  cell: (product) => (
                    <span className={product.stock_current <= product.stock_min ? "font-semibold text-red-700" : ""}>
                      {product.stock_current}
                    </span>
                  ),
                  className: "w-24"
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
                  <h2 className="text-xl font-semibold">{selectedProduct.name}</h2>
                  <StatusBadge status={selectedProduct.status} />
                  {isLowStock ? <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700">Estoque critico</span> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedProduct.category} - {selectedProduct.supplier}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => navigate(`/stock?product=${selectedProduct.id}&action=move`)}>
                  <Boxes className="size-4" />
                  Movimentar
                </Button>
                <Button variant="outline" onClick={() => navigate(`/sales?product=${selectedProduct.id}`)}>
                  <ShoppingCart className="size-4" />
                  Vendas
                </Button>
                <Button variant="outline" onClick={() => navigate(`/fiscal?product=${selectedProduct.id}`)}>
                  <FileText className="size-4" />
                  Fiscal
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs
            tabs={[
              {
                value: "gerais",
                label: "Dados gerais",
                content: (
                  <DetailGrid
                    items={[
                      { label: "SKU", value: selectedProduct.sku },
                      { label: "Codigo de barras", value: selectedProduct.barcode },
                      { label: "Unidade", value: selectedProduct.unit },
                      { label: "Categoria", value: selectedProduct.category },
                      { label: "Fornecedor", value: selectedProduct.supplier },
                      { label: "Peso", value: `${selectedProduct.weight_kg} kg` },
                      { label: "Custo", value: formatCurrency(selectedProduct.cost_price) },
                      { label: "Venda", value: formatCurrency(selectedProduct.sale_price) },
                      { label: "Descricao", value: selectedProduct.description }
                    ]}
                  />
                )
              },
              {
                value: "fiscal",
                label: "Informacoes fiscais",
                content: (
                  <DetailGrid
                    items={[
                      { label: "NCM", value: selectedProduct.ncm },
                      { label: "CFOP", value: selectedProduct.cfop },
                      { label: "IPI padrao", value: "0%" },
                      { label: "ICMS estimado", value: "12%" },
                      { label: "PIS/COFINS", value: "1,65% / 7,6%" },
                      { label: "Operacao", value: "Venda de mercadoria adquirida de terceiros" }
                    ]}
                  />
                )
              },
              {
                value: "estoque",
                label: "Movimentacoes",
                content: (
                  <DataTable
                    data={productMovements}
                    keyExtractor={(movement) => movement.id}
                    columns={[
                      { header: "Data", cell: (movement) => formatDate(movement.date) },
                      { header: "Tipo", cell: (movement) => movement.type },
                      { header: "Quantidade", cell: (movement) => movement.quantity },
                      { header: "Saldo", cell: (movement) => `${movement.previous_stock} -> ${movement.new_stock}` },
                      { header: "Razao", cell: (movement) => movement.reason }
                    ]}
                  />
                )
              },
              {
                value: "precos",
                label: "Tabela de precos",
                content: (
                  <DetailGrid
                    items={[
                      { label: "Preco de custo", value: formatCurrency(selectedProduct.cost_price) },
                      { label: "Preco de venda", value: formatCurrency(selectedProduct.sale_price) },
                      { label: "Margem bruta", value: `${(((selectedProduct.sale_price - selectedProduct.cost_price) / selectedProduct.sale_price) * 100).toFixed(1)}%` },
                      { label: "Tabela atacado", value: formatCurrency(selectedProduct.sale_price * 0.94) },
                      { label: "Tabela obra", value: formatCurrency(selectedProduct.sale_price * 0.9) },
                      { label: "Promocional", value: formatCurrency(selectedProduct.sale_price * 0.87) }
                    ]}
                  />
                )
              },
              {
                value: "fornecedores",
                label: "Fornecedores",
                content: (
                  <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                      <History className="size-4 text-primary" />
                      <div>
                        <p className="font-medium">{selectedProduct.supplier}</p>
                        <p className="text-sm text-muted-foreground">Fornecedor principal associado ao produto.</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              },
              {
                value: "historico",
                label: "Historico",
                content: (
                  <DataTable
                    data={productSales}
                    keyExtractor={(sale) => sale.id}
                    onRowClick={(sale) => navigate(`/sales?sale=${sale.id}`)}
                    columns={[
                      { header: "Pedido", cell: (sale) => sale.number },
                      { header: "Cliente", cell: (sale) => sale.client_name },
                      { header: "Data", cell: (sale) => formatDate(sale.date) },
                      { header: "Total", cell: (sale) => formatCurrency(sale.total) }
                    ]}
                  />
                )
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
