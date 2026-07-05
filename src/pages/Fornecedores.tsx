import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Plus } from "lucide-react";
import { api } from "../lib/api";
import { Badge, Button, Card, EmptyState, ErrorNote, Field, Input, Modal, PageHeader, Table, useData } from "../components/ui";
import type { Fornecedor } from "../types";

const FORM_VAZIO = { razao_social: "", nome_fantasia: "", cnpj: "", email: "", telefone: "", cidade: "", uf: "" };

export default function Fornecedores() {
  const { data, reload } = useData(() => api.get<Fornecedor[]>("/fornecedores"));
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState(FORM_VAZIO);

  const criar = (e: FormEvent) => {
    e.preventDefault();
    api
      .post("/fornecedores", form)
      .then(() => {
        setOpen(false);
        setForm(FORM_VAZIO);
        setErro(null);
        reload();
      })
      .catch((err: Error) => setErro(err.message));
  };

  const set = (k: keyof typeof FORM_VAZIO) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <PageHeader
        title="Fornecedores"
        subtitle="Cadastro de fornecedores. Preços e condições ficam no vínculo fornecedor × variação."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={15} /> Novo fornecedor
          </Button>
        }
      />

      <Card>
        <Table headers={["Fornecedor", "CNPJ", "Contato", "Cidade/UF", "Ofertas", ""]}>
          {data?.map((f) => (
            <tr key={f.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link to={`/fornecedores/${f.id}`} className="font-semibold text-slate-900 hover:text-amber-600">
                  {f.nome_fantasia || f.razao_social}
                </Link>
                <p className="text-xs text-slate-400">{f.razao_social}</p>
              </td>
              <td className="px-4 py-3 font-mono text-xs">{f.cnpj || "—"}</td>
              <td className="px-4 py-3 text-slate-600">
                {f.email || "—"}
                {f.telefone && <p className="text-xs text-slate-400">{f.telefone}</p>}
              </td>
              <td className="px-4 py-3">{f.cidade ? `${f.cidade}/${f.uf ?? ""}` : "—"}</td>
              <td className="px-4 py-3">
                <Badge tone="amber">{f.num_ofertas} oferta(s)</Badge>
              </td>
              <td className="px-4 py-3 text-right">
                <Link to={`/fornecedores/${f.id}`} className="inline-flex text-slate-400 hover:text-amber-600">
                  <ChevronRight size={18} />
                </Link>
              </td>
            </tr>
          ))}
        </Table>
        {data?.length === 0 && <EmptyState>Nenhum fornecedor cadastrado.</EmptyState>}
      </Card>

      <Modal title="Novo fornecedor" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={criar} className="space-y-4">
          <ErrorNote message={erro} />
          <Field label="Razão social">
            <Input required value={form.razao_social} onChange={set("razao_social")} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nome fantasia">
              <Input value={form.nome_fantasia} onChange={set("nome_fantasia")} />
            </Field>
            <Field label="CNPJ">
              <Input value={form.cnpj} onChange={set("cnpj")} placeholder="00.000.000/0000-00" />
            </Field>
            <Field label="E-mail">
              <Input type="email" value={form.email} onChange={set("email")} />
            </Field>
            <Field label="Telefone">
              <Input value={form.telefone} onChange={set("telefone")} />
            </Field>
            <Field label="Cidade">
              <Input value={form.cidade} onChange={set("cidade")} />
            </Field>
            <Field label="UF">
              <Input maxLength={2} value={form.uf} onChange={set("uf")} placeholder="SP" />
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
