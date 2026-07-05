import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Scale, Trash2, Wand2 } from "lucide-react";
import { abrevia, api, brl } from "../lib/api";
import { Badge, Button, Card, EmptyState, ErrorNote, Field, Input, Modal, PageHeader, Table, useData } from "../components/ui";
import type { Atributo, ProdutoDetalhado } from "../types";

// Produto cartesiano das seleções: [[a,b],[x]] -> [[a,x],[b,x]]
function combina<T>(listas: T[][]): T[][] {
  return listas.reduce<T[][]>((acc, lista) => acc.flatMap((c) => lista.map((item) => [...c, item])), [[]]);
}

export default function ProdutoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: produto, reload } = useData(() => api.get<ProdutoDetalhado>(`/produtos/${id}`), [id]);
  const { data: atributos } = useData(() => api.get<Atributo[]>("/atributos"));
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [prefixo, setPrefixo] = useState("");
  const [form, setForm] = useState({ estoque: "0", estoque_minimo: "0", preco_venda: "" });
  // atributo_id -> Set de valor_atributo_id marcados
  const [selecao, setSelecao] = useState<Record<number, number[]>>({});

  const prefixoEfetivo = prefixo || (produto ? abrevia(produto.nome, 4) : "SKU");

  // Combinações previstas, com SKU gerado automaticamente (sem digitação = sem erro).
  const combinacoes = useMemo(() => {
    if (!atributos) return [];
    const eixos = atributos
      .filter((a) => (selecao[a.id] ?? []).length > 0)
      .map((a) => a.valores.filter((v) => selecao[a.id].includes(v.id)));
    if (eixos.length === 0) return [];
    return combina(eixos).map((valores) => ({
      sku: [prefixoEfetivo, ...valores.map((v) => abrevia(v.valor))].join("-"),
      valor_atributo_ids: valores.map((v) => v.id),
      rotulo: valores.map((v) => v.valor).join(" · ")
    }));
  }, [atributos, selecao, prefixoEfetivo]);

  if (!produto) return <EmptyState>Carregando…</EmptyState>;

  const skusExistentes = new Set(produto.variacoes.map((v) => v.sku));

  const alternar = (atributoId: number, valorId: number) =>
    setSelecao((s) => {
      const atual = s[atributoId] ?? [];
      const next = atual.includes(valorId) ? atual.filter((v) => v !== valorId) : [...atual, valorId];
      return { ...s, [atributoId]: next };
    });

  const gerar = (e: FormEvent) => {
    e.preventDefault();
    api
      .post<{ criadas: number; ignoradas: number }>(`/produtos/${id}/variacoes/gerar`, {
        combinacoes,
        estoque: Number(form.estoque) || 0,
        estoque_minimo: Number(form.estoque_minimo) || 0,
        preco_venda: form.preco_venda === "" ? null : Number(form.preco_venda)
      })
      .then(({ criadas, ignoradas }) => {
        setOpen(false);
        setErro(null);
        setSelecao({});
        setAviso(`${criadas} variação(ões) criada(s)${ignoradas > 0 ? `, ${ignoradas} já existia(m) e foi(ram) ignorada(s)` : ""}.`);
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
              <Wand2 size={15} /> Gerar variações
            </Button>
          </div>
        }
      />
      <ErrorNote message={erro} />
      {aviso && <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{aviso}</p>}

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
          <EmptyState>Nenhuma variação — use "Gerar variações" para criar todas as combinações de uma vez.</EmptyState>
        )}
      </Card>

      <Modal title={`Gerar variações — ${produto.nome}`} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={gerar} className="space-y-4">
          <ErrorNote message={erro} />
          <p className="text-xs text-slate-500">
            Marque os valores de cada atributo: todas as combinações são geradas de uma vez, com SKU automático — cadastro
            rápido e sem erro de digitação.
          </p>
          <div className="space-y-3 rounded-lg bg-slate-50 p-3">
            {atributos?.map((attr) => (
              <div key={attr.id}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{attr.nome}</p>
                <div className="flex flex-wrap gap-1.5">
                  {attr.valores.map((v) => {
                    const marcado = (selecao[attr.id] ?? []).includes(v.id);
                    return (
                      <button
                        type="button"
                        key={v.id}
                        onClick={() => alternar(attr.id, v.id)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          marcado
                            ? "border-amber-500 bg-amber-500 text-white"
                            : "border-slate-300 bg-white text-slate-600 hover:border-amber-400"
                        }`}
                      >
                        {v.valor}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {atributos?.length === 0 && (
              <p className="text-xs text-slate-400">
                Nenhum atributo cadastrado — crie em <Link to="/atributos" className="text-amber-600">Atributos</Link>.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Prefixo do SKU">
              <Input value={prefixo} onChange={(e) => setPrefixo(e.target.value.toUpperCase())} placeholder={prefixoEfetivo} />
            </Field>
            <Field label="Preço de venda (todas)">
              <Input type="number" step="0.01" value={form.preco_venda} onChange={(e) => setForm({ ...form, preco_venda: e.target.value })} placeholder="R$" />
            </Field>
            <Field label="Estoque inicial (todas)">
              <Input type="number" step="any" value={form.estoque} onChange={(e) => setForm({ ...form, estoque: e.target.value })} />
            </Field>
            <Field label="Estoque mínimo (todas)">
              <Input type="number" step="any" value={form.estoque_minimo} onChange={(e) => setForm({ ...form, estoque_minimo: e.target.value })} />
            </Field>
          </div>

          {combinacoes.length > 0 && (
            <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-100 text-slate-500">
                  <tr>
                    <th className="px-3 py-1.5 font-semibold">SKU gerado</th>
                    <th className="px-3 py-1.5 font-semibold">Combinação</th>
                    <th className="px-3 py-1.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {combinacoes.map((c) => (
                    <tr key={c.sku}>
                      <td className="px-3 py-1.5 font-mono">{c.sku}</td>
                      <td className="px-3 py-1.5">{c.rotulo}</td>
                      <td className="px-3 py-1.5 text-right">
                        {skusExistentes.has(c.sku) ? <Badge tone="slate">já existe</Badge> : <Badge tone="green">nova</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {combinacoes.length === 0
                ? "Nenhum valor marcado ainda."
                : `${combinacoes.length} combinação(ões) prevista(s).`}
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={combinacoes.length === 0}>
                <Plus size={14} /> Criar {combinacoes.length > 0 ? combinacoes.length : ""} variação(ões)
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
