import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthApi } from '@/api/client';

export interface BankAccount {
  account_id: string;
  tenant_id: string;
  cbu: string;
  cbu_formatted: string;
  alias?: string;
  holder_name: string;
  is_active: boolean;
  is_configured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BankAccountRequest {
  cbu: string;
  alias?: string;
  holder_name: string;
}

export const useTenantBankAccount = () => {
  const authApi = useAuthApi();
  const queryClient = useQueryClient();

  // Get current configuration
  const useGetAccount = () => {
    return useQuery<BankAccount | null>({
      queryKey: ['tenant-bank-account'],
      queryFn: async () => {
        const response = await authApi.get('/api/tenant/bank-account');
        return response.data;
      },
    });
  };

  // Create or update configuration
  const useSaveAccount = () => {
    return useMutation({
      mutationFn: async (data: BankAccountRequest) => {
        const response = await authApi.post('/api/tenant/bank-account', data);
        return response.data as BankAccount;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tenant-bank-account'] });
      },
    });
  };

  // Delete configuration
  const useDeleteAccount = () => {
    return useMutation({
      mutationFn: async () => {
        const response = await authApi.delete('/api/tenant/bank-account');
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tenant-bank-account'] });
      },
    });
  };

  return {
    useGetAccount,
    useSaveAccount,
    useDeleteAccount,
  };
};
