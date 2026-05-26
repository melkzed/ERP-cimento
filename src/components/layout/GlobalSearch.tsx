import * as React from "react";
import { FileText, Package, ReceiptText, Search, ShoppingCart, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { useErpData } from "@/hooks/useErpData";
import { normalize } from "@/lib/utils";

interface SearchItem {
  module: string;
  label: string;
  description: string;
  icon: React.ElementType;
  to: string;
}

export function GlobalSearch() {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { data } = useErpData();
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const items = React.useMemo<SearchItem[]>(() => {
    if (!data) return [];
    return [
      ...data.clients.map((client) => ({
        module: "Clientes",
        label: client.name,
        description: `${client.document} - ${client.city}/${client.state}`,
        icon: UserRound,
        to: `/clients?client=${client.id}`
      })),
      ...data.products.map((product) => ({
        module: "Produtos",
        label: product.name,
        description: `${product.sku} - estoque ${product.stock_current} ${product.unit}`,
        icon: Package,
        to: `/products?product=${product.id}`
      })),
      ...data.sales.map((sale) => ({
        module: "Vendas",
        label: sale.number,
        description: `${sale.client_name} - ${sale.status}`,
        icon: ShoppingCart,
        to: `/sales?sale=${sale.id}`
      })),
      ...data.invoices.map((invoice) => ({
        module: "Fiscal",
        label: invoice.number,
        description: `${invoice.client_name} - ${invoice.status}`,
        icon: FileText,
        to: `/fiscal?invoice=${invoice.id}`
      })),
      ...data.financialEntries.map((entry) => ({
        module: "Financeiro",
        label: entry.description,
        description: `${entry.bank} - ${entry.status}`,
        icon: ReceiptText,
        to: `/financial?entry=${entry.id}`
      }))
    ];
  }, [data]);

  const results = React.useMemo(() => {
    const normalized = normalize(query);
    if (normalized.length < 2) return [];
    return items
      .filter((item) =>
        normalize(`${item.module} ${item.label} ${item.description}`).includes(normalized)
      )
      .slice(0, 12);
  }, [items, query]);

  const grouped = results.reduce<Record<string, SearchItem[]>>((acc, item) => {
    acc[item.module] = acc[item.module] ?? [];
    acc[item.module].push(item);
    return acc;
  }, {});

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar cliente, produto, venda, nota ou financeiro"
        className="pl-9"
      />
      {open && query.length >= 2 ? (
        <div className="absolute left-0 right-0 top-12 z-40 max-h-[460px] overflow-auto rounded-lg border bg-card p-2 shadow-soft">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado.
            </p>
          ) : (
            Object.entries(grouped).map(([module, moduleItems]) => (
              <div key={module} className="py-1">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                  {module}
                </p>
                {moduleItems.map((item) => (
                  <button
                    key={`${item.module}-${item.label}`}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-muted"
                    onClick={() => {
                      navigate(item.to);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
                      <item.icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{item.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
