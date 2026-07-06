import { FormEvent, useState } from "react";
import { api } from "../lib/api";
import { Button, ErrorNote, Field, Input } from "./ui";

const FORM_VAZIO = { razao_social: "", nome_fantasia: "", cnpj: "", email: "", telefone: "", cidade: "", uf: "" };

// Formulário de fornecedor reutilizável: usado na página Fornecedores e
// embutido ("cadastro inline") nos modais de produto e de oferta — ao salvar,
// devolve o id criado para o chamador selecionar automaticamente.
export default function FornecedorForm({
  onSaved,
  onCancel,
  cancelLabel = "Cancelar"
}: {
  onSaved: (id: number) => void;
  onCancel: () => void;
  cancelLabel?: string;
}) {
  const [form, setForm] = useState(FORM_VAZIO);
  const [erro, setErro] = useState<string | null>(null);

  const set = (k: keyof typeof FORM_VAZIO) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const salvar = (e: FormEvent) => {
    e.preventDefault();
    api
      .post("/fornecedores", form)
      .then((r) => onSaved(r.id))
      .catch((err: Error) => setErro(err.message));
  };

  return (
    <form onSubmit={salvar} className="space-y-4">
      <ErrorNote message={erro} />
      <Field label="Razão social">
        <Input required autoFocus value={form.razao_social} onChange={set("razao_social")} />
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
        <Button variant="ghost" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button type="submit">Salvar fornecedor</Button>
      </div>
    </form>
  );
}
