import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthApi } from '@/api/client';

export interface GymPayment {
  payment_id: string;
  member_id: string;
  user_id: string;
  payment_type: 'membership' | 'enrollment' | 'renewal' | 'class' | 'personal_training' | 'product' | 'penalty' | 'other';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  payment_method?: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'mercadopago' | 'check' | 'other';
  membership_plan_id?: string;
  invoice_id?: string;
  payment_date?: string;
  due_date?: string;
  processed_at?: string;
  is_paid: boolean;
  is_overdue: boolean;
  days_overdue?: number;
  external_payment_id?: string;
  external_reference?: string;
  payment_link?: string;
  description?: string;
  notes?: string;
  refunded_amount: number;
  remaining_amount: number;
  refund_reason?: string;
  refunded_at?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface PaymentListParams {
  member_id?: string;
  status?: string;
  payment_type?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

export interface PaymentCreateData {
  member_id: string;
  payment_type: string;
  amount: number;
  currency?: string;
  status?: string;
  payment_method?: string;
  membership_plan_id?: string;
  invoice_id?: string;
  payment_date?: string;
  due_date?: string;
  description?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface PaymentSummary {
  total_payments: number;
  completed_payments: number;
  pending_payments: number;
  failed_payments: number;
  total_revenue: number;
  pending_amount: number;
  total_refunded: number;
}

export interface RevenueByType {
  revenue_by_type: Record<string, number>;
  total: number;
  from_date: string;
  to_date: string;
}

export const useGymPayments = () => {
  const authApi = useAuthApi();
  const queryClient = useQueryClient();

  // List payments
  const useListPayments = (params: PaymentListParams = {}) => {
    return useQuery({
      queryKey: ['gym-payments', params],
      queryFn: async () => {
        const queryParams = new URLSearchParams();
        if (params.member_id) queryParams.append('member_id', params.member_id);
        if (params.status) queryParams.append('status', params.status);
        if (params.payment_type) queryParams.append('payment_type', params.payment_type);
        if (params.from_date) queryParams.append('from_date', params.from_date);
        if (params.to_date) queryParams.append('to_date', params.to_date);
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.offset) queryParams.append('offset', params.offset.toString());

        const response = await authApi.get(`/api/gym/payments?${queryParams.toString()}`);
        return response.data;
      },
    });
  };

  // Get payment by ID
  const useGetPayment = (paymentId: string) => {
    return useQuery({
      queryKey: ['gym-payment', paymentId],
      queryFn: async () => {
        const response = await authApi.get(`/api/gym/payments/${paymentId}`);
        return response.data;
      },
      enabled: !!paymentId,
    });
  };

  // Get member payments
  const useMemberPayments = (memberId: string, status?: string) => {
    return useQuery({
      queryKey: ['gym-member-payments', memberId, status],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);

        const response = await authApi.get(`/api/gym/payments/member/${memberId}?${params.toString()}`);
        return response.data;
      },
      enabled: !!memberId,
    });
  };

  // Get pending payments
  const usePendingPayments = (overdueOnly: boolean = false) => {
    return useQuery({
      queryKey: ['gym-payments-pending', overdueOnly],
      queryFn: async () => {
        const response = await authApi.get(`/api/gym/payments/pending?overdue_only=${overdueOnly}`);
        return response.data;
      },
    });
  };

  // Get overdue payments
  const useOverduePayments = (daysOverdue?: number) => {
    return useQuery({
      queryKey: ['gym-payments-overdue', daysOverdue],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (daysOverdue) params.append('days_overdue', daysOverdue.toString());

        const response = await authApi.get(`/api/gym/payments/overdue?${params.toString()}`);
        return response.data;
      },
    });
  };

  // Get upcoming due payments
  const useUpcomingPayments = (daysAhead: number = 7) => {
    return useQuery({
      queryKey: ['gym-payments-upcoming', daysAhead],
      queryFn: async () => {
        const response = await authApi.get(`/api/gym/payments/upcoming?days_ahead=${daysAhead}`);
        return response.data;
      },
    });
  };

  // Get payment summary
  const usePaymentSummary = (fromDate: string, toDate: string) => {
    return useQuery({
      queryKey: ['gym-payment-summary', fromDate, toDate],
      queryFn: async (): Promise<PaymentSummary> => {
        const response = await authApi.get(`/api/gym/payments/summary?from_date=${fromDate}&to_date=${toDate}`);
        return response.data;
      },
      enabled: !!fromDate && !!toDate,
    });
  };

  // Get revenue by type
  const useRevenueByType = (fromDate: string, toDate: string) => {
    return useQuery({
      queryKey: ['gym-revenue-by-type', fromDate, toDate],
      queryFn: async (): Promise<RevenueByType> => {
        const response = await authApi.get(`/api/gym/payments/revenue-by-type?from_date=${fromDate}&to_date=${toDate}`);
        return response.data;
      },
      enabled: !!fromDate && !!toDate,
    });
  };

  // Get member balance
  const useMemberBalance = (memberId: string) => {
    return useQuery({
      queryKey: ['gym-member-balance', memberId],
      queryFn: async () => {
        const response = await authApi.get(`/api/gym/payments/member/${memberId}/balance`);
        return response.data;
      },
      enabled: !!memberId,
    });
  };

  // Create payment
  const useCreatePayment = () => {
    return useMutation({
      mutationFn: async (data: PaymentCreateData) => {
        const response = await authApi.post('/api/gym/payments', data);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gym-payments'] });
      },
    });
  };

  // Update payment
  const useUpdatePayment = () => {
    return useMutation({
      mutationFn: async ({ paymentId, data }: { paymentId: string; data: Partial<PaymentCreateData> }) => {
        const response = await authApi.put(`/api/gym/payments/${paymentId}`, data);
        return response.data;
      },
      onSuccess: (_, { paymentId }) => {
        queryClient.invalidateQueries({ queryKey: ['gym-payment', paymentId] });
        queryClient.invalidateQueries({ queryKey: ['gym-payments'] });
      },
    });
  };

  // Update payment status
  const useUpdatePaymentStatus = () => {
    return useMutation({
      mutationFn: async ({
        paymentId,
        status,
        processed_at,
        external_payment_id
      }: {
        paymentId: string;
        status: string;
        processed_at?: string;
        external_payment_id?: string;
      }) => {
        const response = await authApi.patch(`/api/gym/payments/${paymentId}/status`, {
          status,
          processed_at,
          external_payment_id,
        });
        return response.data;
      },
      onSuccess: (_, { paymentId }) => {
        queryClient.invalidateQueries({ queryKey: ['gym-payment', paymentId] });
        queryClient.invalidateQueries({ queryKey: ['gym-payments'] });
      },
    });
  };

  // Process refund
  const useProcessRefund = () => {
    return useMutation({
      mutationFn: async ({ paymentId, amount, reason }: { paymentId: string; amount: number; reason: string }) => {
        const response = await authApi.post(`/api/gym/payments/${paymentId}/refund`, {
          amount,
          reason,
        });
        return response.data;
      },
      onSuccess: (_, { paymentId }) => {
        queryClient.invalidateQueries({ queryKey: ['gym-payment', paymentId] });
        queryClient.invalidateQueries({ queryKey: ['gym-payments'] });
      },
    });
  };

  // Create payment link
  const useCreatePaymentLink = () => {
    return useMutation({
      mutationFn: async ({ paymentId, paymentLink }: { paymentId: string; paymentLink: string }) => {
        const response = await authApi.post(`/api/gym/payments/${paymentId}/payment-link`, {
          payment_link: paymentLink,
        });
        return response.data;
      },
      onSuccess: (_, { paymentId }) => {
        queryClient.invalidateQueries({ queryKey: ['gym-payment', paymentId] });
      },
    });
  };

  return {
    useListPayments,
    useGetPayment,
    useMemberPayments,
    usePendingPayments,
    useOverduePayments,
    useUpcomingPayments,
    usePaymentSummary,
    useRevenueByType,
    useMemberBalance,
    useCreatePayment,
    useUpdatePayment,
    useUpdatePaymentStatus,
    useProcessRefund,
    useCreatePaymentLink,
  };
};