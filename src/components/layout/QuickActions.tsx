import * as React from "react";
import {
  Banknote,
  Boxes,
  ChevronDown,
  ClipboardList,
  FileSearch,
  PackagePlus,
  ReceiptText,
  ShoppingCart,
  UserPlus
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastContext";

const actions = [
  { label: "Novo cliente", icon: UserPlus, to: "/clients?action=new" },
  { label: "Nova venda", icon: ShoppingCart, to: "/sales?action=new" },
  { label: "Entrada de estoque", icon: Boxes, to: "/stock?action=inbound" },
  { label: "Nova compra", icon: PackagePlus, to: "/stock?action=purchase" },
  { label: "Recebimento", icon: Banknote, to: "/financial?action=receive" },
  { label: "Relatorio rapido", icon: ClipboardList, to: "/reports?view=quick" },
  { label: "Consulta fiscal", icon: FileSearch, to: "/fiscal?action=query" },
  { label: "Consulta bancaria", icon: ReceiptText, to: "/financial?action=bank" }
];

export function QuickActions() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Button onClick={() => setOpen((current) => !current)}>
        Acoes
        <ChevronDown className="size-4" />
      </Button>
      {open ? (
        <div className="absolute right-0 top-12 z-40 w-64 rounded-lg border bg-card p-2 shadow-soft">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => {
                navigate(action.to);
                setOpen(false);
                toast({
                  title: action.label,
                  description: "Fluxo aberto no modulo correspondente.",
                  variant: "success"
                });
              }}
            >
              <action.icon className="size-4 text-primary" />
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
