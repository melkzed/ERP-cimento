import { Link } from "react-router-dom";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { api, brl } from "../lib/api";
import { Badge, Card, EmptyState, PageHeader, Table, useData } from "../components/ui";
import type { Dashboard as DashboardData } from "../types";

const stats: { key: keyof DashboardData; label: string; to: string }[] = [
  { key: "produtos", label: "Produtos", to: "/produtos" },
  { key: "variacoes", label: "Variações (SKUs)", to: "/produtos" },
  { key: "categorias", label: "Categorias", to: "/categorias" },
  { key: "atributos", label: "Atributos", to: "/atributos" },
  { key: "fornecedores", label: "Fornecedores", to: "/fornecedores" },
  { key: "ofertas", label: "Ofertas cadastradas", to: "/comparador" }
];

export default function Dashboard() {
  const { data } = useData(() => api.get<DashboardData>("/dashboard"));
  if (!data) return <EmptyState>Carregando…</EmptyState>;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Visão geral do catálogo, fornecedores e melhores condições de compra." />

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Link key={s.label} to={s.to}>
            <Card className="p-4 transition hover:border-amber-400">
              <p className="text-3xl font-bold text-slate-900">{data[s.key] as number}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <TrendingDown size={16} className="text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Melhor custo por SKU (fornecedor vencedor)</h2>
          </div>
          <Table headers={["SKU", "Produto", "Fornecedor", "Condição", "Custo efetivo"]}>
            {data.melhoresOfertas.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-2.5 font-mono text-xs">{o.sku}</td>
                <td className="px-4 py-2.5">{o.produto}</td>
                <td className="px-4 py-2.5">{o.fornecedor}</td>
                <td className="px-4 py-2.5">
                  <Badge tone="amber">{o.condicao}</Badge>
                </td>
                <td className="px-4 py-2.5 font-semibold text-emerald-700">{brl(o.custo_efetivo)}</td>
              </tr>
            ))}
          </Table>
          {data.melhoresOfertas.length === 0 && <EmptyState>Nenhuma oferta cadastrada ainda.</EmptyState>}
        </Card>

        <Card>
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <AlertTriangle size={16} className="text-red-500" />
            <h2 className="text-sm font-bold text-slate-900">Estoque abaixo do mínimo</h2>
          </div>
          <Table headers={["SKU", "Produto", "Estoque", "Mínimo"]}>
            {data.estoqueBaixo.map((v) => (
              <tr key={v.id}>
                <td className="px-4 py-2.5 font-mono text-xs">{v.sku}</td>
                <td className="px-4 py-2.5">{v.produto}</td>
                <td className="px-4 py-2.5">
                  <Badge tone="red">
                    {v.estoque} {v.unidade}
                  </Badge>
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  {v.estoque_minimo} {v.unidade}
                </td>
              </tr>
            ))}
          </Table>
          {data.estoqueBaixo.length === 0 && <EmptyState>Nenhum SKU abaixo do estoque mínimo. 👍</EmptyState>}
        </Card>
      </div>
    </>
  );
}
