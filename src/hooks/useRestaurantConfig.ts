import { useQuery } from '@tanstack/react-query';
import { configApi, type ConfigType } from '@/api/configApi';

/**
 * Load a live configuration section for POS / billing / QR consumers.
 * Prefer this over hardcoding tax, payments, or receipt options.
 */
export function useRestaurantConfig(type: ConfigType, branchId?: number | null) {
  return useQuery({
    queryKey: ['runtime-config', type, branchId],
    queryFn: () => configApi.get(type, branchId),
    staleTime: 60_000,
  });
}

export function useEnabledPaymentMethods(branchId?: number | null) {
  return useQuery({
    queryKey: ['runtime-payments', branchId],
    queryFn: async () => {
      const methods = (await configApi.listPayments(branchId)) as Array<{
        IsEnabled: number;
        DisplayName: string;
        MethodCode: string;
        SortOrder: number;
        Instructions?: string;
      }>;
      return methods
        .filter((m) => m.IsEnabled)
        .sort((a, b) => a.SortOrder - b.SortOrder);
    },
    staleTime: 60_000,
  });
}

export function useTaxRates(branchId?: number | null) {
  return useQuery({
    queryKey: ['runtime-tax-rates', branchId],
    queryFn: () => configApi.listTaxRates(branchId),
    staleTime: 60_000,
  });
}
