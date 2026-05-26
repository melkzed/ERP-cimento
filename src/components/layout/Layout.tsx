import * as React from "react";
import {
  BarChart3,
  Boxes,
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  ReceiptText,
  Settings,
  ShoppingCart,
  UserRound,
  X
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "./GlobalSearch";
import { QuickActions } from "./QuickActions";

const navigation = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Clientes", to: "/clients", icon: UserRound },
  { label: "Produtos", to: "/products", icon: Package },
  { label: "Estoque", to: "/stock", icon: Boxes },
  { label: "Vendas", to: "/sales", icon: ShoppingCart },
  { label: "Fiscal", to: "/fiscal", icon: FileText },
  { label: "Financeiro", to: "/financial", icon: ReceiptText },
  { label: "Relatorios", to: "/reports", icon: BarChart3 },
  { label: "Central Operacional", to: "/operations", icon: ClipboardList },
  { label: "Configuracoes", to: "/settings", icon: Settings }
];

export function Layout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r bg-card transition-transform lg:translate-x-0",
          mobileOpen && "translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="font-semibold leading-none">CimentoERP</p>
              <p className="mt-1 text-xs text-muted-foreground">Operacoes integradas</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="size-5" />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t p-4">
          <div className="rounded-md bg-muted p-3">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {user?.role.toUpperCase()} - {user?.company}
            </p>
          </div>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-foreground/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
        />
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </Button>
          <GlobalSearch />
          <div className="ml-auto">
            <QuickActions />
          </div>
        </header>
        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
