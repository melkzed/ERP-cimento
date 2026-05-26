import { useQuery } from "@tanstack/react-query";

import { erpRepository } from "@/lib/repository";

export function useErpData() {
  return useQuery({
    queryKey: ["erp-data"],
    queryFn: () => erpRepository.all(),
    staleTime: 1000 * 60 * 3
  });
}

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: () => erpRepository.clients()
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => erpRepository.products()
  });
}

export function useSales() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: () => erpRepository.sales()
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: () => erpRepository.invoices()
  });
}

export function useFinancialEntries() {
  return useQuery({
    queryKey: ["financial-entries"],
    queryFn: () => erpRepository.financialEntries()
  });
}

export function useStockMovements() {
  return useQuery({
    queryKey: ["stock-movements"],
    queryFn: () => erpRepository.stockMovements()
  });
}
