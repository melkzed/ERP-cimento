import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Factory, Plus } from "lucide-react";
import { api } from "../lib/api";
import { Badge, Button, Card, EmptyState, ErrorNote, Field, Input, Modal, PageHeader, Select, Table, useData } from "../components/ui";
import FornecedorForm from "../components/FornecedorForm";
import type { Categoria, Fornecedor, Produto } from "../types";

const FORM_VAZIO = { nome: "", descricao: "", categoria_id: "", unidade: "UN" };

export default function Produtos() {
  const { data, reload } = useData(() => api.get<Produto[]>("/produtos"));
  const { data: categorias } = useData(() => api.get<Categoria[]>("/categorias"));
  const { data: fornecedores, reload: reloadFornecedores } = useData(() => api.get<Fornecedor[]>("/fornecedores"));
  const [open, setOpen] = useState(false);
  // 'produto' | 'fornecedor': o formulário do produto continua montado quando a
  // tela troca para o cadastro de fornecedor — nada digitado se perde.
  const [view, setView] = useState<"produto" | "fornecedor">("produto");
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [fornecedorIds, setFornecedorIds] = useState<number[]>([]);

  const fechar = () => {
    setOpen(false);
    setView("produto");
  };

  const criar = (e: FormEvent) => {
    e.preventDefault();
    api
      .post("/produtos", { ...form, categoria_id: Number(form.categoria_id) || null, fornecedor_ids: fornecedorIds })
      .then(() => {
        fechar();
        setForm(FORM_VAZIO);
        setFornecedorIds([]);
        setErro(null);
        reload();
      })
      .catch((err: Error) => setErro(err.message));
  };

  const alternarFornecedor = (id: number) =>
    setFornecedorIds((s) => (s.includes(id) ? s.filter((f) => f !== id) : [...s, id]));

  return (
    <>
      <PageHeader
        title="Produtos"
        subtitle="O produto 'pai' é só o conceito — preço, estoque e fornecedor vivem nas variações (SKUs). Categoria e fornecedores são escolhidos de listas, nunca digitados."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={15} /> Novo produto
          </Button>
        }
      />

      <Card>
        <Table headers={["Produto", "Categoria", "Variações", "Fornecedores", "Estoque total", ""]}>
          {data?.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link to={`/produtos/${p.id}`} className="font-semibold text-slate-900 hover:text-amber-600">
                  {p.nome}
                </Link>
                {p.descricao && <p className="text-xs text-slate-400">{p.descricao}</p>}
              </td>
              <td className="px-4 py-3">{p.categoria ? <Badge>{p.categoria}</Badge> : "—"}</td>
              <td className="px-4 py-3">
                <Badge tone="amber">{p.num_variacoes} SKU(s)</Badge>
              </td>
              <td className="px-4 py-3">
                <Badge tone={p.num_fornecedores ? "green" : "slate"}>{p.num_fornecedores} fornecedor(es)</Badge>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {p.estoque_total} {p.unidade}
              </td>
              <td className="px-4 py-3 text-right">
                <Link to={`/produtos/${p.id}`} className="inline-flex text-slate-400 hover:text-amber-600">
                  <ChevronRight size={18} />
                </Link>
              </td>
            </tr>
          ))}
        </Table>
        {data?.length === 0 && <EmptyState>Nenhum produto cadastrado.</EmptyState>}
      </Card>

      <Modal
        title={view === "produto" ? "Novo produto" : "Novo fornecedor (o produto continua salvo aqui atrás)"}
        open={open}
        onClose={fechar}
      >
        {view === "fornecedor" ? (
          <FornecedorForm
            cancelLabel="← Voltar ao produto"
            onCancel={() => setView("produto")}
            onSaved={(id) => {
              reloadFornecedores();
              setFornecedorIds((s) => [...s, id]);
              setView("produto");
            }}
          />
        ) : (
          <form onSubmit={criar} className="space-y-4">
            <ErrorNote message={erro} />
            <Field label="Nome">
              <Input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Camisa Polo Piquet" />
            </Field>
            <Field label="Descrição">
              <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Categoria">
                <Select required value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}>
                  <option value="">Selecione…</option>
                  {categorias?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Unidade">
                <Input value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })} placeholder="UN, PAR, KIT…" />
              </Field>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Fornecedores deste produto {fornecedorIds.length > 0 && `(${fornecedorIds.length} selecionado(s))`}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {fornecedores?.map((f) => {
                  const marcado = fornecedorIds.includes(f.id);
                  return (
                    <button
                      type="button"
                      key={f.id}
                      onClick={() => alternarFornecedor(f.id)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        marcado
                          ? "border-amber-500 bg-amber-500 text-white"
                          : "border-slate-300 bg-white text-slate-600 hover:border-amber-400"
                      }`}
                    >
                      {f.nome_fantasia || f.razao_social}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setView("fornecedor")}
                  className="rounded-full border border-dashed border-amber-500 px-3 py-1 text-xs font-semibold text-amber-600 transition hover:bg-amber-50"
                >
                  <Factory size={12} className="mr-1 inline" />+ Cadastrar novo fornecedor
                </button>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Não achou o fornecedor? Cadastre sem sair daqui — ao salvar, você volta para este formulário com tudo preenchido.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={fechar}>
                Cancelar
              </Button>
              <Button type="submit">Salvar produto</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
