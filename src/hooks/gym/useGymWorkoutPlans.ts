/**
 * Hook for managing workout plans from gym.condamind.com
 *
 * Flow:
 * 1. Get trainer by tenantId from gym.condamind.com admin API
 * 2. Query plans directly by trainerId from the same API
 *
 * Note: The gym app has its own trainers/clients tables (gymTrainers, gymTrainerClients)
 * which are separate from assistants-api. This hook queries the gym app directly.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/context/TenantContext';
import {
  gymConsoleClient,
  type GymWorkoutPlan,
  type GymPlanUpdate,
  type GymTrainer,
  type GymTrainerClient,
  type GymPlansListResponse,
} from '@/api/gymConsoleClient';
import { toast } from 'sonner';

// Re-export types for convenience
export type { GymWorkoutPlan, GymPlanUpdate, GymTrainer, GymTrainerClient };
export type { GymPlanContent, GymWorkoutDay, GymExercise, GymPlansListResponse } from '@/api/gymConsoleClient';

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
const GYM_TRAINER_QUERY_KEY = ['gym', 'trainer'];
const GYM_CLIENTS_QUERY_KEY = ['gym', 'clients'];

export const useGymWorkoutPlans = () => {
  const queryClient = useQueryClient();
  const { orgId: tenantId } = useTenant();

  // Get trainer for current tenant from gym app
  const useTrainer = () => {
    return useQuery({
      queryKey: [...GYM_TRAINER_QUERY_KEY, tenantId],
      queryFn: async () => {
        if (!tenantId) return null;
        return await gymConsoleClient.getTrainerByTenant(tenantId);
      },
      enabled: !!tenantId,
    });
  };

  // Get clients for a trainer from gym app
  const useClients = (trainerId: string, status: string = 'active') => {
    return useQuery({
      queryKey: [...GYM_CLIENTS_QUERY_KEY, trainerId, status],
      queryFn: async () => {
        return await gymConsoleClient.getTrainerClients(trainerId, status);
      },
      enabled: !!trainerId,
    });
  };

  // Get all plans for current trainer's clients
  const usePlans = (filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    return useQuery({
      queryKey: [...GYM_PLANS_QUERY_KEY, 'list', tenantId, filters],
      queryFn: async () => {
        if (!tenantId) throw new Error('No tenant selected');

        // Step 1: Get trainer for this tenant
        const trainer = await gymConsoleClient.getTrainerByTenant(tenantId);
        if (!trainer) {
          return { plans: [], total: 0, trainer: null, plansByClient: [], clientCount: 0 };
        }

        // Step 2: Query plans directly from gym app
        const plansResponse = await gymConsoleClient.getTrainerClientPlans(trainer.id, {
          status: filters?.status,
          limit: filters?.limit,
          offset: filters?.offset,
        });

        return plansResponse;
      },
      enabled: !!tenantId,
    });
  };

  // Get a single plan by ID
  const usePlan = (planId: string) => {
    return useQuery({
      queryKey: [...GYM_PLANS_QUERY_KEY, planId],
      queryFn: async () => {
        return await gymConsoleClient.getPlan(planId);
      },
      enabled: !!planId,
    });
  };

  // Get all plans grouped by client for a trainer
  // trainerId parameter is kept for API compatibility but we query by tenantId
  const useTrainerClientPlans = (_trainerId: string, filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    return useQuery({
      queryKey: [...GYM_PLANS_QUERY_KEY, 'trainer', tenantId, 'clients', filters],
      queryFn: async () => {
        if (!tenantId) throw new Error('No tenant selected');

        // Step 1: Get trainer for this tenant from gym app
        const trainer = await gymConsoleClient.getTrainerByTenant(tenantId);
        if (!trainer) {
          return {
            trainer: { id: '', businessName: null, tenantId: '' },
            plans: [],
            plansByClient: [],
            total: 0,
            clientCount: 0,
          } as GymTrainerClientPlansResponse;
        }

        // Step 2: Get plans with grouping from gym app
        const plansResponse = await gymConsoleClient.getTrainerClientPlans(trainer.id, {
          status: filters?.status,
          limit: filters?.limit || 100,
          offset: filters?.offset,
        });

        return {
          trainer: {
            id: trainer.id,
            businessName: trainer.businessName,
            tenantId: trainer.tenantId,
          },
          plans: plansResponse.plans,
          plansByClient: plansResponse.plansByClient,
          total: plansResponse.total,
          clientCount: plansResponse.clientCount,
        } as GymTrainerClientPlansResponse;
      },
      enabled: !!tenantId,
    });
  };

  // Update a plan
  const useUpdatePlan = () => {
    return useMutation({
      mutationFn: async ({ planId, updates }: { planId: string; updates: GymPlanUpdate }) => {
        return await gymConsoleClient.updatePlan(planId, updates);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: [...GYM_PLANS_QUERY_KEY, variables.planId] });
        queryClient.invalidateQueries({ queryKey: [...GYM_PLANS_QUERY_KEY, 'list'] });
        queryClient.invalidateQueries({ queryKey: [...GYM_PLANS_QUERY_KEY, 'trainer'] });
        toast.success('Plan actualizado');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || error.message || 'Error al actualizar plan');
      },
    });
  };

  // Assign and Duplicate operations
  const useAssignPlan = () => {
    return useMutation({
      mutationFn: async ({ planId, assignment }: { planId: string; assignment: { clientUserId: string } }) => {
        toast.error('Asignacion de planes aun no implementada');
        throw new Error('Not implemented');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Error al asignar plan');
      },
    });
  };

  const useDuplicatePlan = () => {
    return useMutation({
      mutationFn: async ({ planId, options }: { planId: string; options?: { targetUserId?: string } }) => {
        toast.error('Duplicacion de planes aun no implementada');
        throw new Error('Not implemented');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Error al duplicar plan');
      },
    });
  };

  return {
    // Queries
    useTrainer,
    useClients,
    usePlans,
    usePlan,
    useTrainerClientPlans,

    // Mutations
    useUpdatePlan,
    useAssignPlan,
    useDuplicatePlan,
  };
};
