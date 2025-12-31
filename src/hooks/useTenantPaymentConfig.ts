import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthApi } from '@/api/client';

export interface PaymentConfig {
  config_id: string;
  tenant_id: string;
  provider: string;
  is_active: boolean;
  is_configured: boolean;
  access_token_masked?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentConfigRequest {
  access_token: string;
  provider?: string;
}

export interface TestResult {
  status: 'success' | 'error';
  message: string;
  user_id?: number;
}

export const useTenantPaymentConfig = () => {
  const authApi = useAuthApi();
  const queryClient = useQueryClient();

  // Get current configuration
  const useGetConfig = () => {
    return useQuery<PaymentConfig | null>({
      queryKey: ['tenant-payment-config'],
      queryFn: async () => {
        const response = await authApi.get('/api/tenant/payment-config');
        return response.data;
      },
    });
  };

  // Create or update configuration
  const useSaveConfig = () => {
    return useMutation({
      mutationFn: async (data: PaymentConfigRequest) => {
        const response = await authApi.post('/api/tenant/payment-config', data);
        return response.data as PaymentConfig;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tenant-payment-config'] });
      },
    });
  };

  // Delete configuration
  const useDeleteConfig = () => {
    return useMutation({
      mutationFn: async () => {
        const response = await authApi.delete('/api/tenant/payment-config');
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tenant-payment-config'] });
      },
    });
  };

  // Test configuration
  const useTestConfig = () => {
    return useMutation<TestResult>({
      mutationFn: async () => {
        const response = await authApi.post('/api/tenant/payment-config/test');
        return response.data;
      },
    });
  };

  return {
    useGetConfig,
    useSaveConfig,
    useDeleteConfig,
    useTestConfig,
  };
};
