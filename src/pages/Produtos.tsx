import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Plus } from "lucide-react";
import { api } from "../lib/api";
import { Badge, Button, Card, EmptyState, ErrorNote, Field, Input, Modal, PageHeader, Select, Table, useData } from "../components/ui";
import type { Categoria, Produto } from "../types";

export default function Produtos() {
  const { data, reload } = useData(() => api.get<Produto[]>("/produtos"));
  const { data: categorias } = useData(() => api.get<Categoria[]>("/categorias"));
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", descricao: "", categoria_id: "", unidade: "UN" });

  const criar = (e: FormEvent) => {
    e.preventDefault();
    api
      .post("/produtos", { ...form, categoria_id: Number(form.categoria_id) || null })
      .then(() => {
        setOpen(false);
        setForm({ nome: "", descricao: "", categoria_id: "", unidade: "UN" });
        setErro(null);
        reload();
      })
      .catch((err: Error) => setErro(err.message));
  };

  return (
    <>
      <PageHeader
        title="Produtos"
        subtitle="O produto 'pai' é só o conceito — preço, estoque e fornecedor vivem nas variações (SKUs). Categoria é escolhida da lista, nunca digitada."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={15} /> Novo produto
          </Button>
        }
      />

      <Card>
        <Table headers={["Produto", "Categoria", "Unidade", "Variações", "Estoque total", ""]}>
          {data?.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link to={`/produtos/${p.id}`} className="font-semibold text-slate-900 hover:text-amber-600">
                  {p.nome}
                </Link>
                {p.descricao && <p className="text-xs text-slate-400">{p.descricao}</p>}
              </td>
              <td className="px-4 py-3">{p.categoria ? <Badge>{p.categoria}</Badge> : "—"}</td>
              <td className="px-4 py-3 text-slate-500">{p.unidade}</td>
              <td className="px-4 py-3">
                <Badge tone="amber">{p.num_variacoes} SKU(s)</Badge>
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

      <Modal title="Novo produto" open={open} onClose={() => setOpen(false)}>
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
          <p className="text-xs text-slate-400">
            Falta a categoria certa? Cadastre em <Link to="/categorias" className="text-amber-600">Categorias</Link> primeiro.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
