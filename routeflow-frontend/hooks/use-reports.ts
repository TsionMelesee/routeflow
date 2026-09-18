import { useQuery } from "@tanstack/react-query";
import { reportsApi, type ReportFilterParams } from "@/lib/api/reports";

export function useDeliveriesReport(params: ReportFilterParams) {
  return useQuery({
    queryKey: ["reports", "deliveries", params],
    queryFn: async () => (await reportsApi.deliveries(params)).data,
  });
}

export function useDriversReport(params: ReportFilterParams) {
  return useQuery({
    queryKey: ["reports", "drivers", params],
    queryFn: () => reportsApi.drivers(params),
  });
}

export function useWarehousesReport(params: ReportFilterParams) {
  return useQuery({
    queryKey: ["reports", "warehouses", params],
    queryFn: () => reportsApi.warehouses(params),
  });
}

export function useRevenueReport(params: ReportFilterParams) {
  return useQuery({
    queryKey: ["reports", "revenue", params],
    queryFn: async () => (await reportsApi.revenue(params)).data,
  });
}
