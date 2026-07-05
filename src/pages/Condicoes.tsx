import { FormEvent, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { Badge, Button, Card, EmptyState, ErrorNote, Field, Input, Modal, PageHeader, Table, useData } from "../components/ui";
import type { CondicaoPagamento } from "../types";

export default function Condicoes() {
  const { data, reload } = useData(() => api.get<CondicaoPagamento[]>("/condicoes"));
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", num_parcelas: "1", taxa_juros: "0", dias_carencia: "0" });

  const criar = (e: FormEvent) => {
    e.preventDefault();
    api
      .post("/condicoes", {
        nome: form.nome,
        num_parcelas: Number(form.num_parcelas) || 1,
        taxa_juros: Number(form.taxa_juros) || 0,
        dias_carencia: Number(form.dias_carencia) || 0
      })
      .then(() => {
        setOpen(false);
        setForm({ nome: "", num_parcelas: "1", taxa_juros: "0", dias_carencia: "0" });
        setErro(null);
        reload();
      })
      .catch((err: Error) => setErro(err.message));
  };

  const excluir = (c: CondicaoPagamento) =>
    api.delete(`/condicoes/${c.id}`).then(reload).catch((err: Error) => setErro(err.message));

  return (
    <>
      <PageHeader
        title="Condições de pagamento"
        subtitle="Catálogo reutilizável — nada de 'chumbar' juros na linha do fornecedor. Cada oferta referencia uma condição por FK."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={15} /> Nova condição
          </Button>
        }
      />
      <ErrorNote message={erro} />

      <Card>
        <Table headers={["Nome", "Parcelas", "Taxa de juros", "Carência", "Em uso", ""]}>
          {data?.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-semibold text-slate-900">{c.nome}</td>
              <td className="px-4 py-3">{c.num_parcelas}×</td>
              <td className="px-4 py-3">
                {c.taxa_juros > 0 ? <Badge tone="red">+{c.taxa_juros}%</Badge> : <Badge tone="green">sem juros</Badge>}
              </td>
              <td className="px-4 py-3">{c.dias_carencia} dias</td>
              <td className="px-4 py-3">
                <Badge>{c.em_uso} oferta(s)</Badge>
              </td>
              <td className="px-4 py-3 text-right">
                <Button variant="danger" onClick={() => excluir(c)} disabled={(c.em_uso ?? 0) > 0}>
                  <Trash2 size={14} />
                </Button>
              </td>
            </tr>
          ))}
        </Table>
        {data?.length === 0 && <EmptyState>Nenhuma condição cadastrada.</EmptyState>}
      </Card>

      <Modal title="Nova condição de pagamento" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={criar} className="space-y-4">
          <ErrorNote message={erro} />
          <Field label="Nome">
            <Input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: 30/60/90 dias" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Nº de parcelas">
              <Input type="number" min={1} value={form.num_parcelas} onChange={(e) => setForm({ ...form, num_parcelas: e.target.value })} />
            </Field>
            <Field label="Juros (% total)">
              <Input type="number" step="0.1" min={0} value={form.taxa_juros} onChange={(e) => setForm({ ...form, taxa_juros: e.target.value })} />
            </Field>
            <Field label="Carência (dias)">
              <Input type="number" min={0} value={form.dias_carencia} onChange={(e) => setForm({ ...form, dias_carencia: e.target.value })} />
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
