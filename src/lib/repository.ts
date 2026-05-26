import { supabase } from "@/api/supabaseClient";
import { seedData } from "@/data/seed";
import type {
  Client,
  ErpData,
  FinancialEntry,
  Invoice,
  Product,
  Sale,
  StockMovement
} from "@/types/erp";

async function listTable<T>(tableName: string, fallback: T[]): Promise<T[]> {
  if (!supabase) {
    return fallback;
  }

  const { data, error } = await supabase.from(tableName).select("*");
  if (error) {
    console.warn(`Supabase ${tableName}.select() failed; using seed data.`, error);
    return fallback;
  }

  const typedData = data as T[] | null;
  return Array.isArray(typedData) && typedData.length > 0 ? typedData : fallback;
}

export const erpRepository = {
  clients: () => listTable<Client>("clients", seedData.clients),
  products: () => listTable<Product>("products", seedData.products),
  sales: () => listTable<Sale>("sales", seedData.sales),
  invoices: () => listTable<Invoice>("invoices", seedData.invoices),
  financialEntries: () => listTable<FinancialEntry>("financial_entries", seedData.financialEntries),
  stockMovements: () => listTable<StockMovement>("stock_movements", seedData.stockMovements),
  async all(): Promise<ErpData> {
    const [clients, products, sales, invoices, financialEntries, stockMovements] =
      await Promise.all([
        this.clients(),
        this.products(),
        this.sales(),
        this.invoices(),
        this.financialEntries(),
        this.stockMovements()
      ]);

    return {
      clients,
      products,
      sales,
      invoices,
      financialEntries,
      stockMovements
    };
  }
};
