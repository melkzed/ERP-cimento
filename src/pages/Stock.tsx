import * as React from "react";
import { Boxes, PackagePlus, Search } from "lucide-react";
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
import { formatDate, normalize } from "@/lib/utils";
import type { Product } from "@/types/erp";

export function StockPage() {
  const { data, isLoading } = useErpData();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState(params.get("filter") ?? "todos");
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isLoading || !data) return <Loader />;

  const filteredProducts = data.products.filter((product) => {
    const matchesFilter = filter === "todos" || product.stock_current <= product.stock_min;
    const matchesQuery = normalize(`${product.name} ${product.sku} ${product.category}`).includes(normalize(query));
    return matchesFilter && matchesQuery;
  });

  const selectedProduct =
    filteredProducts.find((product) => product.id === params.get("product")) ??
    filteredProducts[0] ??
    data.products[0];
  const movements = data.stockMovements.filter(
    (movement) => movement.product_id === selectedProduct.id
  );
  const allLowStock = data.products.filter((product) => product.stock_current <= product.stock_min);

  function selectProduct(product: Product) {
    setParams((current) => {
      current.set("product", product.id);
      return current;
    });
  }

  return (
    <div>
      <PageHeader
        title="Estoque"
        description="Saldo, minimo, entradas, saidas, reservas, ajustes e necessidades de compra."
        icon={Boxes}
        action={{
          label: "Entrada",
          icon: PackagePlus,
          onClick: () =>
            toast({
              title: "Entrada de estoque",
              description: "Fluxo pronto para StockMovement.create() no Supabase e ajuste de saldo.",
              variant: "success"
            })
        }}
      />

      <div className="grid gap-4 p-4 lg:grid-cols-[430px_1fr] lg:p-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Produtos em estoque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-[1fr_140px] lg:grid-cols-1 xl:grid-cols-[1fr_140px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="pl-9"
                  placeholder="Buscar produto"
                />
              </div>
              <Select value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option value="todos">Todos</option>
                <option value="low">Criticos</option>
              </Select>
            </div>
            <DataTable
              data={filteredProducts}
              keyExtractor={(product) => product.id}
              selectedId={selectedProduct.id}
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
                  header: "Saldo",
                  cell: (product) => (
                    <span className={product.stock_current <= product.stock_min ? "font-semibold text-red-700" : ""}>
                      {product.stock_current}
                    </span>
                  )
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
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Saldo atual {selectedProduct.stock_current} {selectedProduct.unit} - minimo {selectedProduct.stock_min}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => navigate(`/products?product=${selectedProduct.id}`)}>
                  Abrir produto
                </Button>
                <Button
                  onClick={() =>
                    toast({
                      title: "Movimentacao preparada",
                      description: "Entrada, saida e ajuste prontos para gravacao.",
                      variant: "success"
                    })
                  }
                >
                  Movimentar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs
            tabs={[
              {
                value: "saldo",
                label: "Saldo e minimo",
                content: (
                  <DetailGrid
                    items={[
                      { label: "Saldo atual", value: selectedProduct.stock_current },
                      { label: "Estoque minimo", value: selectedProduct.stock_min },
                      { label: "Unidade", value: selectedProduct.unit },
                      { label: "Status reposicao", value: selectedProduct.stock_current <= selectedProduct.stock_min ? "Comprar" : "Normal" },
                      { label: "Fornecedor", value: selectedProduct.supplier },
                      { label: "Categoria", value: selectedProduct.category }
                    ]}
                  />
                )
              },
              {
                value: "movimentos",
                label: "Movimentacoes",
                content: (
                  <DataTable
                    data={movements}
                    keyExtractor={(movement) => movement.id}
                    columns={[
                      { header: "Data", cell: (movement) => formatDate(movement.date) },
                      { header: "Tipo", cell: (movement) => movement.type },
                      { header: "Qtd.", cell: (movement) => movement.quantity },
                      { header: "Antes", cell: (movement) => movement.previous_stock },
                      { header: "Depois", cell: (movement) => movement.new_stock },
                      { header: "Razao", cell: (movement) => movement.reason }
                    ]}
                  />
                )
              },
              {
                value: "criticos",
                label: "Estoque critico",
                content: (
                  <DataTable
                    data={allLowStock}
                    keyExtractor={(product) => product.id}
                    onRowClick={selectProduct}
                    columns={[
                      { header: "Produto", cell: (product) => product.name },
                      { header: "Saldo", cell: (product) => product.stock_current },
                      { header: "Minimo", cell: (product) => product.stock_min },
                      { header: "Comprar", cell: (product) => Math.max(product.stock_min * 2 - product.stock_current, 0) }
                    ]}
                  />
                )
              },
              {
                value: "compras",
                label: "Compras",
                content: (
                  <Card>
                    <CardContent className="space-y-3 p-4">
                      <p className="text-sm text-muted-foreground">
                        Sugestao de compra baseada no estoque minimo e no historico de vendas.
                      </p>
                      <Button
                        onClick={() =>
                          toast({
                            title: "Compra preparada",
                            description: "Pedido de compra pronto para fornecedor associado.",
                            variant: "success"
                          })
                        }
                      >
                        Gerar compra sugerida
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
  );
}
