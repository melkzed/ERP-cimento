import { FormEvent, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { Badge, Button, Card, EmptyState, ErrorNote, Input, PageHeader, useData } from "../components/ui";
import type { Atributo } from "../types";

export default function Atributos() {
  const { data, reload } = useData(() => api.get<Atributo[]>("/atributos"));
  const [novoAtributo, setNovoAtributo] = useState("");
  const [novoValor, setNovoValor] = useState<Record<number, string>>({});
  const [erro, setErro] = useState<string | null>(null);

  const run = (fn: () => Promise<unknown>) =>
    fn()
      .then(() => {
        setErro(null);
        reload();
      })
      .catch((e: Error) => setErro(e.message));

  const criarAtributo = (e: FormEvent) => {
    e.preventDefault();
    if (!novoAtributo.trim()) return;
    run(() => api.post("/atributos", { nome: novoAtributo }));
    setNovoAtributo("");
  };

  const criarValor = (atributoId: number) => {
    const valor = novoValor[atributoId];
    if (!valor?.trim()) return;
    run(() => api.post(`/atributos/${atributoId}/valores`, { valor }));
    setNovoValor((s) => ({ ...s, [atributoId]: "" }));
  };

  return (
    <>
      <PageHeader
        title="Atributos de variação"
        subtitle="Eixos dinâmicos de variação (Tipo, Peso, Bitola…). Um fornecedor trouxe uma variação nova? Cadastre um atributo — sem mexer no banco."
      />
      <ErrorNote message={erro} />

      <form onSubmit={criarAtributo} className="mb-6 flex max-w-md gap-2">
        <Input
          placeholder="Novo atributo (ex.: Cor, Voltagem, Textura…)"
          value={novoAtributo}
          onChange={(e) => setNovoAtributo(e.target.value)}
        />
        <Button type="submit">
          <Plus size={15} /> Criar
        </Button>
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.map((attr) => (
          <Card key={attr.id} className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">{attr.nome}</h2>
              <Button variant="danger" onClick={() => run(() => api.delete(`/atributos/${attr.id}`))}>
                <Trash2 size={14} />
              </Button>
            </div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {attr.valores.map((v) => (
                <span key={v.id} className="group inline-flex items-center gap-1">
                  <Badge tone={v.em_uso > 0 ? "amber" : "slate"}>
                    {v.valor}
                    {v.em_uso > 0 && <span className="ml-1 opacity-60">×{v.em_uso}</span>}
                    {v.em_uso === 0 && (
                      <button
                        className="ml-1 text-slate-400 hover:text-red-600"
                        title="Remover valor"
                        onClick={() => run(() => api.delete(`/valores/${v.id}`))}
                      >
                        ✕
                      </button>
                    )}
                  </Badge>
                </span>
              ))}
              {attr.valores.length === 0 && <span className="text-xs text-slate-400">Sem valores ainda.</span>}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Novo valor…"
                value={novoValor[attr.id] ?? ""}
                onChange={(e) => setNovoValor((s) => ({ ...s, [attr.id]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && criarValor(attr.id)}
              />
              <Button variant="ghost" onClick={() => criarValor(attr.id)}>
                <Plus size={14} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {data?.length === 0 && <EmptyState>Nenhum atributo cadastrado.</EmptyState>}
    </>
  );
}
