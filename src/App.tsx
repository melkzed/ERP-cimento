import { Route, Routes } from "react-router-dom";

import { Layout } from "@/components/layout/Layout";
import { ClientsPage } from "@/pages/Clients";
import { DashboardPage } from "@/pages/Dashboard";
import { FinancialPage } from "@/pages/Financial";
import { FiscalPage } from "@/pages/Fiscal";
import { OperationalCenterPage } from "@/pages/OperationalCenter";
import { ProductsPage } from "@/pages/Products";
import { ReportsPage } from "@/pages/Reports";
import { SalesPage } from "@/pages/Sales";
import { SettingsPage } from "@/pages/Settings";
import { StockPage } from "@/pages/Stock";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="stock" element={<StockPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="fiscal" element={<FiscalPage />} />
        <Route path="financial" element={<FinancialPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="operations" element={<OperationalCenterPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
