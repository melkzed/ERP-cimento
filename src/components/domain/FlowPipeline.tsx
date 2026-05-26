import { Check, CircleDashed } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SaleStatus } from "@/types/erp";

const steps: Array<{ status: SaleStatus; label: string }> = [
  { status: "orcamento", label: "Orcamento" },
  { status: "pedido", label: "Pedido" },
  { status: "estoque", label: "Estoque" },
  { status: "faturamento", label: "Faturamento" },
  { status: "nf_emitida", label: "Nota fiscal" },
  { status: "entrega", label: "Entrega" },
  { status: "concluida", label: "Financeiro" }
];

export function FlowPipeline({ status }: { status: SaleStatus }) {
  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.status === status)
  );
  const next = steps[Math.min(activeIndex + 1, steps.length - 1)];

  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-7">
        {steps.map((step, index) => {
          const done = index < activeIndex || status === "concluida";
          const active = index === activeIndex && status !== "concluida";
          return (
            <div
              key={step.status}
              className={cn(
                "rounded-md border p-3",
                done && "border-emerald-200 bg-emerald-50",
                active && "border-primary bg-primary/5"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border bg-background",
                    done && "border-emerald-500 bg-emerald-500 text-white",
                    active && "border-primary text-primary"
                  )}
                >
                  {done ? <Check className="size-4" /> : <CircleDashed className="size-4" />}
                </span>
                <span className="text-sm font-medium">{step.label}</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        Proximo passo recomendado: <span className="font-medium text-foreground">{next.label}</span>
      </p>
    </div>
  );
}
