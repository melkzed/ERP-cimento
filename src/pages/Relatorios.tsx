import { api, brl } from "../lib/api";
import { Badge, Card, EmptyState, PageHeader, Table, useData } from "../components/ui";
import type { Relatorios as RelatoriosData } from "../types";

export default function Relatorios() {
  const { data } = useData(() => api.get<RelatoriosData>("/relatorios"));
  if (!data) return <EmptyState>Carregando…</EmptyState>;

  const maxValor = Math.max(1, ...data.porCategoria.map((c) => c.valor_estoque));

  return (
    <>
      <PageHeader
        title="Relatórios"
        subtitle="Como categoria é cadastro (FK), o agrupamento sai sempre limpo — sem 'Camiseta' e 'camizeta' virando duas linhas."
      />

      <Card className="mb-6">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Estoque por categoria</h2>
          <p className="text-xs text-slate-400">Valor em estoque = soma de (quantidade × preço de venda) dos SKUs.</p>
        </div>
        <Table headers={["Categoria", "Produtos", "SKUs", "Peças em estoque", "Valor em estoque", ""]}>
          {data.porCategoria.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-semibold text-slate-900">{c.categoria}</td>
              <td className="px-4 py-3">{c.num_produtos}</td>
              <td className="px-4 py-3">{c.num_skus}</td>
              <td className="px-4 py-3">{c.estoque_total}</td>
              <td className="px-4 py-3 font-semibold">{brl(c.valor_estoque)}</td>
              <td className="w-1/3 px-4 py-3">
                <div className="h-3 w-full rounded-sm bg-slate-100">
                  <div
                    className="h-3 rounded-sm bg-amber-500"
                    style={{ width: `${Math.round((c.valor_estoque / maxValor) * 100)}%` }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </Table>
        {data.porCategoria.length === 0 && <EmptyState>Nenhuma categoria cadastrada.</EmptyState>}
      </Card>

      <Card>
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Margem por SKU (preço de venda × melhor custo de compra)</h2>
          <p className="text-xs text-slate-400">
            O melhor custo considera os juros da condição de pagamento de cada fornecedor. Ordenado da maior margem para a menor.
          </p>
        </div>
        <Table headers={["SKU", "Produto", "Categoria", "Preço de venda", "Melhor custo", "Margem", "Margem %"]}>
          {data.margens.map((m) => (
            <tr key={m.id} className="hover:bg-slate-50">
              <td className="px-4 py-2.5 font-mono text-xs">{m.sku}</td>
              <td className="px-4 py-2.5">{m.produto}</td>
              <td className="px-4 py-2.5">{m.categoria ? <Badge>{m.categoria}</Badge> : "—"}</td>
              <td className="px-4 py-2.5">{brl(m.preco_venda)}</td>
              <td className="px-4 py-2.5">{brl(m.melhor_custo)}</td>
              <td className="px-4 py-2.5 font-semibold">{brl(m.margem)}</td>
              <td className="px-4 py-2.5">
                <Badge tone={m.margem_pct >= 50 ? "green" : m.margem_pct >= 25 ? "amber" : "red"}>
                  {m.margem_pct.toLocaleString("pt-BR")}%
                </Badge>
              </td>
            </tr>
          ))}
        </Table>
        {data.margens.length === 0 && (
          <EmptyState>Sem dados de margem — cadastre ofertas de fornecedores e preços de venda nos SKUs.</EmptyState>
        )}
      </Card>
    </>
  );
}
