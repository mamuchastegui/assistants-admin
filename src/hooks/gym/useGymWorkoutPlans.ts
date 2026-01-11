/**
 * Hook for managing workout plans from gym.condamind.com via proxy
 * These are AI-generated plans stored in the gym database (Neon)
 * Different from useWorkoutPlans which uses assistants-api's own database
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthApi } from '@/api/client';
import { toast } from 'sonner';

// Types matching gym.condamind.com schema
export interface GymWorkoutPlan {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  trainer?: {
    id: string;
    businessName: string | null;
    tenantId: string;
  } | null;
  assignedClient?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  assignedAt: string | null;
  plan: GymPlanContent;
  status: 'active' | 'completed' | 'archived';
  aiModel: string | null;
  generationPrompt?: string | null;
  createdAt: string;
  archivedAt: string | null;
}

export interface GymPlanContent {
  programName?: string;
  weeklyPlan?: Record<string, GymWorkoutDay>;
  tips?: string[];
}

export interface GymWorkoutDay {
  dayName: string;
  muscleGroups: string[];
  warmup?: string[];
  exercises: GymExercise[];
  estimatedDuration?: number;
  notes?: string;
}

export interface GymExercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds?: number;
  notes?: string;
}

export interface GymPlanUpdate {
  plan?: Partial<GymPlanContent>;
  status?: 'active' | 'completed' | 'archived';
}

export interface GymPlanAssign {
  clientUserId: string;
  trainerId?: string;
}

export interface GymPlanDuplicate {
  targetUserId?: string;
  trainerId?: string;
}

export interface GymPlansListResponse {
  plans: GymWorkoutPlan[];
  total: number;
}

export interface GymTrainerClientPlansResponse {
  trainer: {
    id: string;
    businessName: string | null;
    tenantId: string;
  };
  plans: GymWorkoutPlan[];
  plansByClient: Array<{
    client: {
      id: string;
      name: string | null;
      email: string;
    };
    plans: GymWorkoutPlan[];
  }>;
  total: number;
  clientCount: number;
}

const GYM_PLANS_QUERY_KEY = ['gym', 'gym-workout-plans'];

export const useGymWorkoutPlans = () => {
  const queryClient = useQueryClient();
  const authApi = useAuthApi();

  // Get all plans for a trainer/tenant
  const usePlans = (filters?: {
    trainerId?: string;
    tenantId?: string;
    clientId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    return useQuery({
      queryKey: [...GYM_PLANS_QUERY_KEY, 'list', filters],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (filters?.trainerId) params.append('trainer_id', filters.trainerId);
        if (filters?.tenantId) params.append('tenant_id', filters.tenantId);
        if (filters?.clientId) params.append('client_id', filters.clientId);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.limit) params.append('limit', String(filters.limit));
        if (filters?.offset) params.append('offset', String(filters.offset));

        const { data } = await authApi.get(`/admin/gym/plans?${params}`);
        return data as GymPlansListResponse;
      },
      enabled: !!(filters?.trainerId || filters?.tenantId),
    });
  };

  // Get a single plan by ID
  const usePlan = (planId: string) => {
    return useQuery({
      queryKey: [...GYM_PLANS_QUERY_KEY, planId],
      queryFn: async () => {
        const { data } = await authApi.get(`/admin/gym/plans/${planId}`);
        return data as GymWorkoutPlan;
      },
      enabled: !!planId,
    });
  };

  // Get all plans for a trainer's clients
  const useTrainerClientPlans = (trainerId: string, filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    return useQuery({
      queryKey: [...GYM_PLANS_QUERY_KEY, 'trainer', trainerId, 'clients', filters],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.limit) params.append('limit', String(filters.limit));
        if (filters?.offset) params.append('offset', String(filters.offset));

        const { data } = await authApi.get(`/admin/gym/trainers/${trainerId}/clients/plans?${params}`);
        return data as GymTrainerClientPlansResponse;
      },
      enabled: !!trainerId,
    });
  };

  // Update a plan
  const useUpdatePlan = () => {
    return useMutation({
      mutationFn: async ({ planId, updates }: { planId: string; updates: GymPlanUpdate }) => {
        const { data } = await authApi.put(`/admin/gym/plans/${planId}`, updates);
        return data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: [...GYM_PLANS_QUERY_KEY, variables.planId] });
        queryClient.invalidateQueries({ queryKey: [...GYM_PLANS_QUERY_KEY, 'list'] });
        queryClient.invalidateQueries({ queryKey: [...GYM_PLANS_QUERY_KEY, 'trainer'] });
        toast.success('Plan actualizado');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || error.response?.data?.error || 'Error al actualizar plan');
      },
    });
  };

  // Assign a plan to a client
  const useAssignPlan = () => {
    return useMutation({
      mutationFn: async ({ planId, assignment }: { planId: string; assignment: GymPlanAssign }) => {
        const { data } = await authApi.post(`/admin/gym/plans/${planId}/assign`, assignment);
        return data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: [...GYM_PLANS_QUERY_KEY, variables.planId] });
        queryClient.invalidateQueries({ queryKey: [...GYM_PLANS_QUERY_KEY, 'list'] });
        queryClient.invalidateQueries({ queryKey: [...GYM_PLANS_QUERY_KEY, 'trainer'] });
        toast.success('Plan asignado al cliente');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || error.response?.data?.error || 'Error al asignar plan');
      },
    });
  };

  // Duplicate a plan
  const useDuplicatePlan = () => {
    return useMutation({
      mutationFn: async ({ planId, options }: { planId: string; options?: GymPlanDuplicate }) => {
        const { data } = await authApi.post(`/admin/gym/plans/${planId}/duplicate`, options || {});
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [...GYM_PLANS_QUERY_KEY, 'list'] });
        queryClient.invalidateQueries({ queryKey: [...GYM_PLANS_QUERY_KEY, 'trainer'] });
        toast.success('Plan duplicado');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || error.response?.data?.error || 'Error al duplicar plan');
      },
    });
  };

  return {
    // Queries
    usePlans,
    usePlan,
    useTrainerClientPlans,

    // Mutations
    useUpdatePlan,
    useAssignPlan,
    useDuplicatePlan,
  };
};
