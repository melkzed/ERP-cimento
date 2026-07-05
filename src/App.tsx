import { NavLink, Route, Routes } from "react-router-dom";
import { Boxes, Factory, LayoutDashboard, Package, Scale, Tags, Wallet } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import ProdutoDetalhe from "./pages/ProdutoDetalhe";
import Atributos from "./pages/Atributos";
import Fornecedores from "./pages/Fornecedores";
import FornecedorDetalhe from "./pages/FornecedorDetalhe";
import Condicoes from "./pages/Condicoes";
import Comparador from "./pages/Comparador";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/produtos", label: "Produtos & SKUs", icon: Package },
  { to: "/atributos", label: "Atributos", icon: Tags },
  { to: "/fornecedores", label: "Fornecedores", icon: Factory },
  { to: "/condicoes", label: "Cond. de Pagamento", icon: Wallet },
  { to: "/comparador", label: "Comparador de Compras", icon: Scale }
];

export default function App() {
  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 w-60 border-r border-slate-200 bg-slate-900 text-slate-300">
        <div className="flex items-center gap-2 px-5 py-5 text-white">
          <Boxes className="text-amber-400" size={24} />
          <div>
            <p className="text-base font-bold leading-tight">ERP Cimento</p>
            <p className="text-[11px] text-slate-400">Catálogo · Fornecedores · Compras</p>
          </div>
        </div>
        <nav className="mt-2 space-y-1 px-3">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? "bg-amber-500 text-white" : "hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="absolute bottom-4 px-5 text-[11px] leading-relaxed text-slate-500">
          Banco local SQLite em <code className="text-slate-400">data/erp.sqlite</code>
        </p>
      </aside>
      <main className="ml-60 flex-1 px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/produtos/:id" element={<ProdutoDetalhe />} />
          <Route path="/atributos" element={<Atributos />} />
          <Route path="/fornecedores" element={<Fornecedores />} />
          <Route path="/fornecedores/:id" element={<FornecedorDetalhe />} />
          <Route path="/condicoes" element={<Condicoes />} />
          <Route path="/comparador" element={<Comparador />} />
        </Routes>
      </main>
    </div>
  );
}
