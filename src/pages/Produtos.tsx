import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Plus } from "lucide-react";
import { api } from "../lib/api";
import { Badge, Button, Card, EmptyState, ErrorNote, Field, Input, Modal, PageHeader, Table, useData } from "../components/ui";
import type { Produto } from "../types";

export default function Produtos() {
  const { data, reload } = useData(() => api.get<Produto[]>("/produtos"));
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", descricao: "", categoria: "", unidade: "UN" });

  const criar = (e: FormEvent) => {
    e.preventDefault();
    api
      .post("/produtos", form)
      .then(() => {
        setOpen(false);
        setForm({ nome: "", descricao: "", categoria: "", unidade: "UN" });
        setErro(null);
        reload();
      })
      .catch((err: Error) => setErro(err.message));
  };

  return (
    <>
      <PageHeader
        title="Produtos"
        subtitle="O produto 'pai' é só o conceito — preço, estoque e fornecedor vivem nas variações (SKUs)."
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
            <Input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Cimento Portland" />
          </Field>
          <Field label="Descrição">
            <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoria">
              <Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Ex.: Cimento" />
            </Field>
            <Field label="Unidade">
              <Input value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })} placeholder="UN, SC, BR…" />
            </Field>
          </div>
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
