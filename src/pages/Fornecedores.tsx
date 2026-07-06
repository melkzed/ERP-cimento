import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Plus } from "lucide-react";
import { api } from "../lib/api";
import { Badge, Button, Card, EmptyState, Modal, PageHeader, Table, useData } from "../components/ui";
import FornecedorForm from "../components/FornecedorForm";
import type { Fornecedor } from "../types";

export default function Fornecedores() {
  const { data, reload } = useData(() => api.get<Fornecedor[]>("/fornecedores"));
  const [open, setOpen] = useState(false);

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
        <FornecedorForm
          onCancel={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            reload();
          }}
        />
      </Modal>
    </>
  );
}
