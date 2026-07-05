import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { api, brl } from "../lib/api";
import { Badge, Button, Card, EmptyState, PageHeader, Table, useData } from "../components/ui";
import type { FornecedorDetalhado } from "../types";

export default function FornecedorDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: f, reload } = useData(() => api.get<FornecedorDetalhado>(`/fornecedores/${id}`), [id]);

  if (!f) return <EmptyState>Carregando…</EmptyState>;

  const excluir = () => {
    if (!confirm(`Excluir o fornecedor "${f.nome_fantasia || f.razao_social}" e todas as suas ofertas?`)) return;
    api.delete(`/fornecedores/${id}`).then(() => navigate("/fornecedores"));
  };

  return (
    <>
      <Link to="/fornecedores" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-amber-600">
        <ArrowLeft size={15} /> Fornecedores
      </Link>
      <PageHeader
        title={f.nome_fantasia || f.razao_social}
        subtitle={[f.razao_social, f.cnpj, f.email, f.telefone, f.cidade && `${f.cidade}/${f.uf}`].filter(Boolean).join(" · ")}
        action={
          <Button variant="danger" onClick={excluir}>
            <Trash2 size={15} /> Excluir fornecedor
          </Button>
        }
      />

      <Card>
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Ofertas deste fornecedor (preço × condição por SKU)</h2>
        </div>
        <Table headers={["SKU", "Produto", "Cód. fornecedor", "Preço", "Condição", "Custo efetivo", "Prazo", "Cobrança", "Qtd. mín.", ""]}>
          {f.ofertas.map((o) => (
            <tr key={o.id} className="hover:bg-slate-50">
              <td className="px-4 py-2.5 font-mono text-xs">{o.sku}</td>
              <td className="px-4 py-2.5">{o.produto}</td>
              <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{o.codigo_no_fornecedor || "—"}</td>
              <td className="px-4 py-2.5">{brl(o.preco_custo)}</td>
              <td className="px-4 py-2.5">
                <Badge tone="amber">{o.condicao}</Badge>
                {o.taxa_juros > 0 && <span className="ml-1 text-xs text-slate-400">+{o.taxa_juros}%</span>}
              </td>
              <td className="px-4 py-2.5 font-semibold text-emerald-700">{brl(o.custo_efetivo)}</td>
              <td className="px-4 py-2.5">{o.prazo_entrega_dias} dias</td>
              <td className="px-4 py-2.5">{o.forma_cobranca}</td>
              <td className="px-4 py-2.5">{o.quantidade_minima}</td>
              <td className="px-4 py-2.5 text-right">
                <Button variant="danger" onClick={() => api.delete(`/ofertas/${o.id}`).then(reload)}>
                  <Trash2 size={14} />
                </Button>
              </td>
            </tr>
          ))}
        </Table>
        {f.ofertas.length === 0 && (
          <EmptyState>
            Nenhuma oferta — vincule este fornecedor a um SKU no <Link to="/comparador" className="text-amber-600">Comparador</Link>.
          </EmptyState>
        )}
      </Card>
    </>
  );
}
