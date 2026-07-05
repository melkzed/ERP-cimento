import { FormEvent, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { Badge, Button, Card, EmptyState, ErrorNote, Input, PageHeader, Table, useData } from "../components/ui";
import type { Categoria } from "../types";

export default function Categorias() {
  const { data, reload } = useData(() => api.get<Categoria[]>("/categorias"));
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const criar = (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    api
      .post("/categorias", { nome })
      .then(() => {
        setNome("");
        setErro(null);
        reload();
      })
      .catch((err: Error) => setErro(err.message));
  };

  const excluir = (c: Categoria) =>
    api.delete(`/categorias/${c.id}`).then(reload).catch((err: Error) => setErro(err.message));

  return (
    <>
      <PageHeader
        title="Categorias"
        subtitle="Cadastro único referenciado por FK: o produto escolhe a categoria numa lista — sem texto livre, sem 'Camizetas' duplicando relatório."
      />
      <ErrorNote message={erro} />

      <form onSubmit={criar} className="mb-6 flex max-w-md gap-2">
        <Input placeholder="Nova categoria (ex.: Saias, Óculos, Relógios…)" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Button type="submit">
          <Plus size={15} /> Criar
        </Button>
      </form>

      <Card className="max-w-2xl">
        <Table headers={["Categoria", "Produtos", ""]}>
          {data?.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-semibold text-slate-900">{c.nome}</td>
              <td className="px-4 py-3">
                <Badge tone={c.num_produtos ? "amber" : "slate"}>{c.num_produtos} produto(s)</Badge>
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="danger"
                  disabled={(c.num_produtos ?? 0) > 0}
                  onClick={() => excluir(c)}
                >
                  <Trash2 size={14} />
                </Button>
              </td>
            </tr>
          ))}
        </Table>
        {data?.length === 0 && <EmptyState>Nenhuma categoria cadastrada.</EmptyState>}
      </Card>
      <p className="mt-3 max-w-2xl text-xs text-slate-400">
        Categorias em uso não podem ser excluídas (FK com RESTRICT) — outra proteção contra bagunça no cadastro.
      </p>
    </>
  );
}
