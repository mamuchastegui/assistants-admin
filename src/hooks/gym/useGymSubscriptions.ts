import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthApi } from '@/api/client';

export type SubscriptionStatus =
  | 'pending_payment'
  | 'active'
  | 'past_due'
  | 'suspended'
  | 'cancelled'
  | 'expired';

export interface GymSubscription {
  subscription_id: string;
  member_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_anchor_day: number;
  current_period_start?: string;
  current_period_end?: string;
  next_billing_date?: string;
  auto_renew: boolean;
  grace_period_days: number;
  can_access_gym: boolean;
  is_within_period: boolean;
  days_until_period_end?: number;
  days_until_next_billing?: number;
  cancelled_at?: string;
  cancellation_reason?: string;
  suspended_at?: string;
  suspension_reason?: string;
  resume_date?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface GymSubscriptionDetail extends GymSubscription {
  plan_name?: string;
  plan_price?: number;
  plan_duration_days?: number;
  plan_duration?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export interface SubscriptionListParams {
  status?: SubscriptionStatus;
  limit?: number;
  offset?: number;
}

export interface SubscriptionListResponse {
  subscriptions: GymSubscription[];
  total: number;
  limit: number;
  offset: number;
}

export interface SubscriptionStats {
  total: number;
  active: number;
  pending_payment: number;
  past_due: number;
  suspended: number;
  cancelled: number;
  expired: number;
}

export interface SubscriptionCreateData {
  member_id: string;
  plan_id: string;
  billing_anchor_day?: number;
  auto_renew?: boolean;
  grace_period_days?: number;
  metadata?: Record<string, unknown>;
}

export interface SubscriptionActivateData {
  period_start: string;
  period_end: string;
  next_billing_date: string;
}

export interface SubscriptionSuspendData {
  reason?: string;
  resume_date?: string;
}

export interface SubscriptionCancelData {
  reason?: string;
}

export interface CanCheckinResponse {
  can_checkin: boolean;
  reason?: string;
  subscription_status?: string;
}

export const useGymSubscriptions = () => {
  const authApi = useAuthApi();
  const queryClient = useQueryClient();

  // List subscriptions
  const useListSubscriptions = (params: SubscriptionListParams = {}) => {
    return useQuery({
      queryKey: ['gym-subscriptions', params],
      queryFn: async () => {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.offset) queryParams.append('offset', params.offset.toString());

        const response = await authApi.get<SubscriptionListResponse>(
          `/api/gym/subscriptions?${queryParams.toString()}`
        );
        return response.data;
      },
    });
  };

  // Get subscription by ID
  const useGetSubscription = (subscriptionId: string) => {
    return useQuery({
      queryKey: ['gym-subscription', subscriptionId],
      queryFn: async () => {
        const response = await authApi.get<GymSubscriptionDetail>(
          `/api/gym/subscriptions/${subscriptionId}`
        );
        return response.data;
      },
      enabled: !!subscriptionId,
    });
  };

  // Get subscriptions for a member
  const useGetMemberSubscriptions = (memberId: string) => {
    return useQuery({
      queryKey: ['gym-member-subscriptions', memberId],
      queryFn: async () => {
        const response = await authApi.get<GymSubscription[]>(
          `/api/gym/subscriptions/member/${memberId}`
        );
        return response.data;
      },
      enabled: !!memberId,
    });
  };

  // Get active subscription for a member
  const useGetMemberActiveSubscription = (memberId: string) => {
    return useQuery({
      queryKey: ['gym-member-active-subscription', memberId],
      queryFn: async () => {
        const response = await authApi.get<GymSubscription | null>(
          `/api/gym/subscriptions/member/${memberId}/active`
        );
        return response.data;
      },
      enabled: !!memberId,
    });
  };

  // Check if member can check-in
  const useCanMemberCheckin = (memberId: string) => {
    return useQuery({
      queryKey: ['gym-member-can-checkin', memberId],
      queryFn: async () => {
        const response = await authApi.get<CanCheckinResponse>(
          `/api/gym/subscriptions/member/${memberId}/can-checkin`
        );
        return response.data;
      },
      enabled: !!memberId,
    });
  };

  // Get subscription stats
  const useSubscriptionStats = () => {
    return useQuery({
      queryKey: ['gym-subscription-stats'],
      queryFn: async () => {
        const response = await authApi.get<SubscriptionStats>(
          '/api/gym/subscriptions/stats/summary'
        );
        return response.data;
      },
    });
  };

  // Get subscriptions due for billing
  const useSubscriptionsDueForBilling = (billingDate?: string) => {
    return useQuery({
      queryKey: ['gym-subscriptions-due', billingDate],
      queryFn: async () => {
        const queryParams = billingDate ? `?billing_date=${billingDate}` : '';
        const response = await authApi.get<GymSubscription[]>(
          `/api/gym/subscriptions/due-for-billing${queryParams}`
        );
        return response.data;
      },
    });
  };

  // Get past due subscriptions
  const usePastDueSubscriptions = () => {
    return useQuery({
      queryKey: ['gym-subscriptions-past-due'],
      queryFn: async () => {
        const response = await authApi.get<GymSubscription[]>(
          '/api/gym/subscriptions/past-due'
        );
        return response.data;
      },
    });
  };

  // Get expiring subscriptions
  const useExpiringSubscriptions = (daysAhead: number = 7) => {
    return useQuery({
      queryKey: ['gym-subscriptions-expiring', daysAhead],
      queryFn: async () => {
        const response = await authApi.get<GymSubscription[]>(
          `/api/gym/subscriptions/expiring-soon?days_ahead=${daysAhead}`
        );
        return response.data;
      },
    });
  };

  // Create subscription
  const useCreateSubscription = () => {
    return useMutation({
      mutationFn: async (data: SubscriptionCreateData) => {
        const response = await authApi.post<GymSubscription>(
          '/api/gym/subscriptions',
          data
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gym-subscriptions'] });
        queryClient.invalidateQueries({ queryKey: ['gym-subscription-stats'] });
      },
    });
  };

  // Activate subscription
  const useActivateSubscription = () => {
    return useMutation({
      mutationFn: async ({
        subscriptionId,
        data
      }: {
        subscriptionId: string;
        data: SubscriptionActivateData
      }) => {
        const response = await authApi.post<GymSubscription>(
          `/api/gym/subscriptions/${subscriptionId}/activate`,
          data
        );
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['gym-subscriptions'] });
        queryClient.invalidateQueries({ queryKey: ['gym-subscription', variables.subscriptionId] });
        queryClient.invalidateQueries({ queryKey: ['gym-subscription-stats'] });
        queryClient.invalidateQueries({ queryKey: ['gym-member-subscriptions'] });
        queryClient.invalidateQueries({ queryKey: ['gym-member-active-subscription'] });
      },
    });
  };

  // Suspend subscription
  const useSuspendSubscription = () => {
    return useMutation({
      mutationFn: async ({
        subscriptionId,
        data
      }: {
        subscriptionId: string;
        data: SubscriptionSuspendData
      }) => {
        const response = await authApi.post<GymSubscription>(
          `/api/gym/subscriptions/${subscriptionId}/suspend`,
          data
        );
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['gym-subscriptions'] });
        queryClient.invalidateQueries({ queryKey: ['gym-subscription', variables.subscriptionId] });
        queryClient.invalidateQueries({ queryKey: ['gym-subscription-stats'] });
      },
    });
  };

  // Cancel subscription
  const useCancelSubscription = () => {
    return useMutation({
      mutationFn: async ({
        subscriptionId,
        data
      }: {
        subscriptionId: string;
        data: SubscriptionCancelData
      }) => {
        const response = await authApi.post<GymSubscription>(
          `/api/gym/subscriptions/${subscriptionId}/cancel`,
          data
        );
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['gym-subscriptions'] });
        queryClient.invalidateQueries({ queryKey: ['gym-subscription', variables.subscriptionId] });
        queryClient.invalidateQueries({ queryKey: ['gym-subscription-stats'] });
      },
    });
  };

  // Run mark past due job
  const useRunMarkPastDueJob = () => {
    return useMutation({
      mutationFn: async () => {
        const response = await authApi.post('/api/gym/subscriptions/jobs/mark-past-due');
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gym-subscriptions'] });
        queryClient.invalidateQueries({ queryKey: ['gym-subscription-stats'] });
      },
    });
  };

  // Run mark expired job
  const useRunMarkExpiredJob = () => {
    return useMutation({
      mutationFn: async () => {
        const response = await authApi.post('/api/gym/subscriptions/jobs/mark-expired');
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gym-subscriptions'] });
        queryClient.invalidateQueries({ queryKey: ['gym-subscription-stats'] });
      },
    });
  };

  return {
    useListSubscriptions,
    useGetSubscription,
    useGetMemberSubscriptions,
    useGetMemberActiveSubscription,
    useCanMemberCheckin,
    useSubscriptionStats,
    useSubscriptionsDueForBilling,
    usePastDueSubscriptions,
    useExpiringSubscriptions,
    useCreateSubscription,
    useActivateSubscription,
    useSuspendSubscription,
    useCancelSubscription,
    useRunMarkPastDueJob,
    useRunMarkExpiredJob,
  };
};
