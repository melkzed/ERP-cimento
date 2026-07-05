import { FormEvent, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Scale, Trash2 } from "lucide-react";
import { api, brl } from "../lib/api";
import { Badge, Button, Card, EmptyState, ErrorNote, Field, Input, Modal, PageHeader, Select, Table, useData } from "../components/ui";
import type { Atributo, ProdutoDetalhado } from "../types";

export default function ProdutoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: produto, reload } = useData(() => api.get<ProdutoDetalhado>(`/produtos/${id}`), [id]);
  const { data: atributos } = useData(() => api.get<Atributo[]>("/atributos"));
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState({ sku: "", estoque: "0", estoque_minimo: "0", preco_venda: "" });
  const [selecao, setSelecao] = useState<Record<number, number>>({}); // atributo_id -> valor_atributo_id

  if (!produto) return <EmptyState>Carregando…</EmptyState>;

  const criarVariacao = (e: FormEvent) => {
    e.preventDefault();
    api
      .post(`/produtos/${id}/variacoes`, {
        sku: form.sku,
        estoque: Number(form.estoque) || 0,
        estoque_minimo: Number(form.estoque_minimo) || 0,
        preco_venda: form.preco_venda === "" ? null : Number(form.preco_venda),
        valor_atributo_ids: Object.values(selecao).filter(Boolean)
      })
      .then(() => {
        setOpen(false);
        setErro(null);
        setForm({ sku: "", estoque: "0", estoque_minimo: "0", preco_venda: "" });
        setSelecao({});
        reload();
      })
      .catch((err: Error) => setErro(err.message));
  };

  const excluirVariacao = (variacaoId: number) =>
    api.delete(`/variacoes/${variacaoId}`).then(reload).catch((err: Error) => setErro(err.message));

  const excluirProduto = () => {
    if (!confirm(`Excluir o produto "${produto.nome}" e todas as suas variações?`)) return;
    api.delete(`/produtos/${id}`).then(() => navigate("/produtos"));
  };

  return (
    <>
      <Link to="/produtos" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-amber-600">
        <ArrowLeft size={15} /> Produtos
      </Link>
      <PageHeader
        title={produto.nome}
        subtitle={[produto.categoria, produto.descricao].filter(Boolean).join(" · ") || undefined}
        action={
          <div className="flex gap-2">
            <Button variant="danger" onClick={excluirProduto}>
              <Trash2 size={15} /> Excluir produto
            </Button>
            <Button onClick={() => setOpen(true)}>
              <Plus size={15} /> Nova variação
            </Button>
          </div>
        }
      />
      <ErrorNote message={erro} />

      <Card>
        <Table headers={["SKU", "Combinação de atributos", "Estoque", "Preço de venda", "Melhor custo", "Ofertas", ""]}>
          {produto.variacoes.map((v) => (
            <tr key={v.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-mono text-xs font-semibold">{v.sku}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {v.valores.map((val) => (
                    <Badge key={val.valor_atributo_id} tone="amber">
                      {val.atributo}: {val.valor}
                    </Badge>
                  ))}
                  {v.valores.length === 0 && <span className="text-xs text-slate-400">sem atributos</span>}
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge tone={v.estoque <= v.estoque_minimo ? "red" : "green"}>
                  {v.estoque} {produto.unidade}
                </Badge>
                <span className="ml-1 text-xs text-slate-400">mín. {v.estoque_minimo}</span>
              </td>
              <td className="px-4 py-3 font-semibold">{brl(v.preco_venda)}</td>
              <td className="px-4 py-3 text-emerald-700">{brl(v.melhor_custo)}</td>
              <td className="px-4 py-3">
                <Link
                  to={`/comparador?variacao=${v.id}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700"
                >
                  <Scale size={14} /> {v.num_ofertas} oferta(s)
                </Link>
              </td>
              <td className="px-4 py-3 text-right">
                <Button variant="danger" onClick={() => excluirVariacao(v.id)}>
                  <Trash2 size={14} />
                </Button>
              </td>
            </tr>
          ))}
        </Table>
        {produto.variacoes.length === 0 && (
          <EmptyState>Nenhuma variação — crie a primeira combinação de atributos para gerar um SKU vendável.</EmptyState>
        )}
      </Card>

      <Modal title={`Nova variação de ${produto.nome}`} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={criarVariacao} className="space-y-4">
          <ErrorNote message={erro} />
          <Field label="SKU (código único)">
            <Input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="Ex.: CIM-CP2-50" />
          </Field>
          <div className="space-y-3 rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Combinação de atributos</p>
            {atributos?.map((attr) => (
              <Field key={attr.id} label={attr.nome}>
                <Select
                  value={selecao[attr.id] ?? ""}
                  onChange={(e) =>
                    setSelecao((s) => {
                      const next = { ...s };
                      if (e.target.value) next[attr.id] = Number(e.target.value);
                      else delete next[attr.id];
                      return next;
                    })
                  }
                >
                  <option value="">— não se aplica —</option>
                  {attr.valores.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.valor}
                    </option>
                  ))}
                </Select>
              </Field>
            ))}
            {atributos?.length === 0 && (
              <p className="text-xs text-slate-400">
                Nenhum atributo cadastrado — crie em <Link to="/atributos" className="text-amber-600">Atributos</Link>.
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Estoque">
              <Input type="number" step="any" value={form.estoque} onChange={(e) => setForm({ ...form, estoque: e.target.value })} />
            </Field>
            <Field label="Estoque mínimo">
              <Input type="number" step="any" value={form.estoque_minimo} onChange={(e) => setForm({ ...form, estoque_minimo: e.target.value })} />
            </Field>
            <Field label="Preço de venda">
              <Input type="number" step="0.01" value={form.preco_venda} onChange={(e) => setForm({ ...form, preco_venda: e.target.value })} placeholder="R$" />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar variação</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
