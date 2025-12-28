import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthApi } from '../useAuthApi';

// Types
export interface GymPlan {
  plan_id: string;
  name: string;
  description: string;
  plan_type: 'basic' | 'standard' | 'premium' | 'vip' | 'student' | 'corporate' | 'family';
  duration: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'custom';
  duration_days: number;
  duration_label: string;
  price: number;
  final_price: number;
  total_initial_cost: number;
  enrollment_fee?: number;
  discount_percentage?: number;
  features: string[];
  class_access: string[];
  max_freezes_allowed: number;
  max_freeze_days: number;
  guest_passes_per_month: number;
  classes_per_week_limit?: number;
  access_hours_start?: string;
  access_hours_end?: string;
  weekend_access: boolean;
  auto_renew: boolean;
  renewal_discount_percentage?: number;
  is_active: boolean;
  is_visible: boolean;
  max_members?: number;
  member_count?: number;
  tags: string[];
  metadata: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePlanInput {
  name: string;
  description: string;
  plan_type?: GymPlan['plan_type'];
  duration: GymPlan['duration'];
  duration_days: number;
  price: number;
  enrollment_fee?: number;
  discount_percentage?: number;
  features?: string[];
  class_access?: string[];
  max_freezes_allowed?: number;
  max_freeze_days?: number;
  guest_passes_per_month?: number;
  classes_per_week_limit?: number;
  access_hours_start?: string;
  access_hours_end?: string;
  weekend_access?: boolean;
  auto_renew?: boolean;
  renewal_discount_percentage?: number;
  is_active?: boolean;
  is_visible?: boolean;
  max_members?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdatePlanInput extends Partial<CreatePlanInput> {}

export interface ListPlansParams {
  is_active?: boolean;
  is_visible?: boolean;
  plan_type?: GymPlan['plan_type'];
}

export interface UpdatePriceInput {
  price: number;
}

export interface UpdateDiscountInput {
  discount_percentage?: number;
}

// Query keys
const PLANS_QUERY_KEY = ['gym', 'plans'];

export const useGymPlans = () => {
  const authApi = useAuthApi();
  const queryClient = useQueryClient();

  // List plans
  const useListPlans = (params?: ListPlansParams) => {
    return useQuery({
      queryKey: [...PLANS_QUERY_KEY, 'list', params],
      queryFn: async () => {
        const queryParams = new URLSearchParams();
        if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
        if (params?.is_visible !== undefined) queryParams.append('is_visible', params.is_visible.toString());
        if (params?.plan_type) queryParams.append('plan_type', params.plan_type);

        const response = await authApi.get(`/api/gym/plans?${queryParams.toString()}`);
        return response.data as GymPlan[];
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get single plan
  const useGetPlan = (planId: string, enabled = true) => {
    return useQuery({
      queryKey: [...PLANS_QUERY_KEY, planId],
      queryFn: async () => {
        const response = await authApi.get(`/api/gym/plans/${planId}`);
        return response.data as GymPlan;
      },
      enabled,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Get popular plans
  const usePopularPlans = (limit = 3) => {
    return useQuery({
      queryKey: [...PLANS_QUERY_KEY, 'popular', limit],
      queryFn: async () => {
        const response = await authApi.get(`/api/gym/plans/popular?limit=${limit}`);
        return response.data as GymPlan[];
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  // Create plan
  const useCreatePlan = () => {
    return useMutation({
      mutationFn: async (data: CreatePlanInput) => {
        const response = await authApi.post('/api/gym/plans', data);
        return response.data as GymPlan;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
        toast.success(`Plan "${data.name}" created successfully`);
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Failed to create plan';
        toast.error(message);
      },
    });
  };

  // Update plan
  const useUpdatePlan = () => {
    return useMutation({
      mutationFn: async ({ planId, data }: { planId: string; data: UpdatePlanInput }) => {
        const response = await authApi.put(`/api/gym/plans/${planId}`, data);
        return response.data as GymPlan;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [...PLANS_QUERY_KEY, data.plan_id] });
        queryClient.invalidateQueries({ queryKey: [...PLANS_QUERY_KEY, 'list'] });
        toast.success(`Plan "${data.name}" updated successfully`);
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Failed to update plan';
        toast.error(message);
      },
    });
  };

  // Delete plan
  const useDeletePlan = () => {
    return useMutation({
      mutationFn: async (planId: string) => {
        const response = await authApi.delete(`/api/gym/plans/${planId}`);
        return response.data;
      },
      onSuccess: (_, planId) => {
        queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
        toast.success('Plan deleted successfully');
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Failed to delete plan';
        toast.error(message);
      },
    });
  };

  // Update price
  const useUpdatePrice = () => {
    return useMutation({
      mutationFn: async ({ planId, price }: { planId: string; price: number }) => {
        const response = await authApi.patch(`/api/gym/plans/${planId}/price`, { price });
        return response.data;
      },
      onSuccess: (_, { planId }) => {
        queryClient.invalidateQueries({ queryKey: [...PLANS_QUERY_KEY, planId] });
        queryClient.invalidateQueries({ queryKey: [...PLANS_QUERY_KEY, 'list'] });
        toast.success('Price updated successfully');
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Failed to update price';
        toast.error(message);
      },
    });
  };

  // Apply/remove discount
  const useUpdateDiscount = () => {
    return useMutation({
      mutationFn: async ({ planId, discount_percentage }: { planId: string; discount_percentage?: number }) => {
        const response = await authApi.patch(`/api/gym/plans/${planId}/discount`, { discount_percentage });
        return response.data;
      },
      onSuccess: (data, { planId }) => {
        queryClient.invalidateQueries({ queryKey: [...PLANS_QUERY_KEY, planId] });
        queryClient.invalidateQueries({ queryKey: [...PLANS_QUERY_KEY, 'list'] });
        toast.success(data.message);
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Failed to update discount';
        toast.error(message);
      },
    });
  };

  // Toggle visibility
  const useToggleVisibility = () => {
    return useMutation({
      mutationFn: async (planId: string) => {
        const response = await authApi.patch(`/api/gym/plans/${planId}/visibility`);
        return response.data;
      },
      onSuccess: (data, planId) => {
        queryClient.invalidateQueries({ queryKey: [...PLANS_QUERY_KEY, planId] });
        queryClient.invalidateQueries({ queryKey: [...PLANS_QUERY_KEY, 'list'] });
        const status = data.is_visible ? 'visible' : 'hidden';
        toast.success(`Plan is now ${status}`);
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Failed to toggle visibility';
        toast.error(message);
      },
    });
  };

  return {
    // Queries
    useListPlans,
    useGetPlan,
    usePopularPlans,
    // Mutations
    useCreatePlan,
    useUpdatePlan,
    useDeletePlan,
    useUpdatePrice,
    useUpdateDiscount,
    useToggleVisibility,
  };
};