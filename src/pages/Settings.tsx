import { Database, KeyRound, ShieldCheck, SlidersHorizontal } from "lucide-react";

import { PageHeader } from "@/components/domain/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/api/supabaseClient";

const schemas = [
  "clients",
  "products",
  "sales",
  "invoices",
  "financial_entries",
  "stock_movements"
];
const roles = ["admin", "vendas", "estoque", "fiscal", "financeiro"];

export function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Configuracoes"
        description="Parametros de integracao, seguranca, entidades e preferencias globais do ERP."
        icon={SlidersHorizontal}
      />
      <div className="grid gap-4 p-4 lg:grid-cols-3 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-4" />
              Supabase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm text-muted-foreground">Configuração</span>
              <Badge variant={isSupabaseConfigured ? "success" : "warning"}>
                {isSupabaseConfigured ? "Configurado" : "Usando seed local"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env` para ativar chamadas reais ao Supabase.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4" />
              RBAC
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <Badge key={role} variant="outline">
                {role}
              </Badge>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-4" />
              Entidades
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {schemas.map((schema) => (
              <Badge key={schema} variant="info">
                {schema}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
