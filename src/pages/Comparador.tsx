import { FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Trash2, Trophy } from "lucide-react";
import { api, brl } from "../lib/api";
import { Badge, Button, Card, EmptyState, ErrorNote, Field, Input, Modal, PageHeader, Select, Table, useData } from "../components/ui";
import type { CondicaoPagamento, Fornecedor, Oferta, Variacao } from "../types";

const FORM_VAZIO = {
  fornecedor_id: "",
  condicao_pagamento_id: "",
  preco_custo: "",
  prazo_entrega_dias: "0",
  forma_cobranca: "PIX",
  quantidade_minima: "1",
  codigo_no_fornecedor: ""
};

export default function Comparador() {
  const [params, setParams] = useSearchParams();
  const variacaoId = params.get("variacao") ?? "";

  const { data: variacoes } = useData(() => api.get<Variacao[]>("/variacoes"));
  const { data: fornecedores } = useData(() => api.get<Fornecedor[]>("/fornecedores"));
  const { data: condicoes } = useData(() => api.get<CondicaoPagamento[]>("/condicoes"));
  const { data: ofertas, reload } = useData(
    () => api.get<Oferta[]>(`/ofertas${variacaoId ? `?variacao_id=${variacaoId}` : ""}`),
    [variacaoId]
  );

  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState(FORM_VAZIO);

  const variacaoAtual = variacoes?.find((v) => String(v.id) === variacaoId);
  const melhorId = ofertas && ofertas.length > 0 ? ofertas[0].id : null;

  const criar = (e: FormEvent) => {
    e.preventDefault();
    api
      .post("/ofertas", {
        variacao_id: Number(variacaoId),
        fornecedor_id: Number(form.fornecedor_id),
        condicao_pagamento_id: Number(form.condicao_pagamento_id),
        preco_custo: Number(form.preco_custo),
        prazo_entrega_dias: Number(form.prazo_entrega_dias) || 0,
        forma_cobranca: form.forma_cobranca,
        quantidade_minima: Number(form.quantidade_minima) || 1,
        codigo_no_fornecedor: form.codigo_no_fornecedor || null
      })
      .then(() => {
        setOpen(false);
        setForm(FORM_VAZIO);
        setErro(null);
        reload();
      })
      .catch((err: Error) => setErro(err.message));
  };

  return (
    <>
      <PageHeader
        title="Comparador de compras"
        subtitle="Escolha um SKU e compare preço, condição de pagamento e prazo entre fornecedores. O custo efetivo já embute os juros da condição."
        action={
          variacaoId ? (
            <Button onClick={() => setOpen(true)}>
              <Plus size={15} /> Nova oferta para este SKU
            </Button>
          ) : undefined
        }
      />
      <ErrorNote message={erro} />

      <div className="mb-5 max-w-xl">
        <Field label="Variação / SKU">
          <Select value={variacaoId} onChange={(e) => setParams(e.target.value ? { variacao: e.target.value } : {})}>
            <option value="">Todas as ofertas (visão geral)</option>
            {variacoes?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.produto} — {v.sku} ({v.valores.map((x) => x.valor).join(", ") || "sem atributos"})
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Card>
        <Table
          headers={[
            variacaoId ? "" : "SKU",
            "Fornecedor",
            "Preço",
            "Condição",
            "Juros",
            "Custo efetivo",
            "Prazo",
            "Cobrança",
            "Qtd. mín.",
            ""
          ].filter((h, i) => !(i === 0 && variacaoId && h === ""))}
        >
          {ofertas?.map((o) => {
            const vencedora = variacaoId !== "" && o.id === melhorId;
            return (
              <tr key={o.id} className={vencedora ? "bg-emerald-50/60" : "hover:bg-slate-50"}>
                {!variacaoId && (
                  <td className="px-4 py-2.5 font-mono text-xs">
                    {o.sku}
                    <p className="text-[11px] text-slate-400">{o.produto}</p>
                  </td>
                )}
                <td className="px-4 py-2.5 font-semibold text-slate-900">
                  <span className="inline-flex items-center gap-1.5">
                    {vencedora && <Trophy size={14} className="text-emerald-600" />}
                    {o.fornecedor}
                  </span>
                </td>
                <td className="px-4 py-2.5">{brl(o.preco_custo)}</td>
                <td className="px-4 py-2.5">
                  <Badge tone="amber">{o.condicao}</Badge>
                  <span className="ml-1 text-xs text-slate-400">{o.num_parcelas}×</span>
                </td>
                <td className="px-4 py-2.5">{o.taxa_juros > 0 ? `+${o.taxa_juros}%` : "—"}</td>
                <td className={`px-4 py-2.5 font-bold ${vencedora ? "text-emerald-700" : "text-slate-700"}`}>
                  {brl(o.custo_efetivo)}
                </td>
                <td className="px-4 py-2.5">{o.prazo_entrega_dias} dias</td>
                <td className="px-4 py-2.5">{o.forma_cobranca}</td>
                <td className="px-4 py-2.5">{o.quantidade_minima}</td>
                <td className="px-4 py-2.5 text-right">
                  <Button variant="danger" onClick={() => api.delete(`/ofertas/${o.id}`).then(reload)}>
                    <Trash2 size={14} />
                  </Button>
                </td>
              </tr>
            );
          })}
        </Table>
        {ofertas?.length === 0 && (
          <EmptyState>
            {variacaoId
              ? "Nenhum fornecedor oferece este SKU ainda — cadastre a primeira oferta."
              : "Nenhuma oferta cadastrada."}
          </EmptyState>
        )}
      </Card>

      <Modal title={`Nova oferta — ${variacaoAtual?.sku ?? ""}`} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={criar} className="space-y-4">
          <ErrorNote message={erro} />
          <Field label="Fornecedor">
            <Select required value={form.fornecedor_id} onChange={(e) => setForm({ ...form, fornecedor_id: e.target.value })}>
              <option value="">Selecione…</option>
              {fornecedores?.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome_fantasia || f.razao_social}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Condição de pagamento">
            <Select required value={form.condicao_pagamento_id} onChange={(e) => setForm({ ...form, condicao_pagamento_id: e.target.value })}>
              <option value="">Selecione…</option>
              {condicoes?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.num_parcelas}×{c.taxa_juros > 0 ? `, +${c.taxa_juros}%` : ", sem juros"})
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Preço de custo (R$)">
              <Input required type="number" step="0.01" min={0} value={form.preco_custo} onChange={(e) => setForm({ ...form, preco_custo: e.target.value })} />
            </Field>
            <Field label="Prazo de entrega (dias)">
              <Input type="number" min={0} value={form.prazo_entrega_dias} onChange={(e) => setForm({ ...form, prazo_entrega_dias: e.target.value })} />
            </Field>
            <Field label="Forma de cobrança">
              <Select value={form.forma_cobranca} onChange={(e) => setForm({ ...form, forma_cobranca: e.target.value })}>
                {["PIX", "Boleto", "Cartão", "Transferência"].map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </Select>
            </Field>
            <Field label="Quantidade mínima">
              <Input type="number" step="any" min={0} value={form.quantidade_minima} onChange={(e) => setForm({ ...form, quantidade_minima: e.target.value })} />
            </Field>
          </div>
          <Field label="Código do produto no fornecedor (opcional)">
            <Input value={form.codigo_no_fornecedor} onChange={(e) => setForm({ ...form, codigo_no_fornecedor: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar oferta</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
