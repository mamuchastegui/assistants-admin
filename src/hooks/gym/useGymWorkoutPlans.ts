/**
 * Hook for managing workout plans from gym.condamind.com (personal-os-console)
 *
 * Flow (simplified with trainer sync):
 * 1. Get trainer profile from assistants-api (/me)
 * 2. Query plans directly by trainerId from personal-os-console
 *
 * Note: Plans are linked to trainers via trainer_id field when user joins
 * a trainer via invite code. This is more reliable than email matching.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthApi } from '@/api/client';
import { gymConsoleClient, type GymWorkoutPlan, type GymPlanUpdate } from '@/api/gymConsoleClient';
import { toast } from 'sonner';

// Re-export types from gymConsoleClient for convenience
export type { GymWorkoutPlan, GymPlanUpdate };
export type { GymPlanContent, GymWorkoutDay, GymExercise, GymPlansListResponse } from '@/api/gymConsoleClient';

// Trainer profile response from assistants-api
interface TrainerProfile {
  id: string;
  tenant_id: string;
  user_id: string;
  business_name: string | null;
  specialty: string | null;
  client_count: number;
}

// Types for assistants-api client response
interface TrainerClient {
  id: string;
  trainer_id: string;
  client_user_id: string;
  status: string;
  client_name: string | null;
  client_email: string | null;
}

interface ClientListResponse {
  clients: TrainerClient[];
  total: number;
  limit: number;
  offset: number;
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

  // Get all plans for current trainer directly by trainerId
  // Much simpler than the old email-matching approach
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
        // Step 1: Get trainer profile to get trainerId
        const { data: trainerData } = await authApi.get<TrainerProfile>('/api/gym/trainers/me');

        // Step 2: Query plans directly by trainerId (no email matching needed!)
        const plansResponse = await gymConsoleClient.getPlans({
          trainerId: trainerData.id,
          trainerTenantId: trainerData.tenant_id,
          status: filters?.status,
          limit: filters?.limit,
          offset: filters?.offset,
        });

        return plansResponse;
      },
      enabled: true,
    });
  };

  // Get a single plan by ID from personal-os-console
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
  // Now uses trainerId for direct querying, with client list for grouping
  const useTrainerClientPlans = (trainerId: string, filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    return useQuery({
      queryKey: [...GYM_PLANS_QUERY_KEY, 'trainer', trainerId, 'clients', filters],
      queryFn: async () => {
        // Step 1: Get trainer info
        const { data: trainerData } = await authApi.get<TrainerProfile>('/api/gym/trainers/me');

        // Step 2: Get plans directly by trainerId (simplified!)
        const plansResponse = await gymConsoleClient.getPlans({
          trainerId: trainerData.id,
          trainerTenantId: trainerData.tenant_id,
          status: filters?.status,
          limit: filters?.limit || 100,
          offset: filters?.offset,
        });

        // Step 3: Get client list for grouping (still needed for UI)
        const { data: clientsData } = await authApi.get<ClientListResponse>(
          '/api/gym/trainers/clients',
          { params: { status: 'active', limit: 500 } }
        );

        // Step 4: Group plans by user (using plan.user instead of client email matching)
        const userPlansMap = new Map<string, GymWorkoutPlan[]>();
        for (const plan of plansResponse.plans) {
          const userEmail = plan.user.email;
          if (!userPlansMap.has(userEmail)) {
            userPlansMap.set(userEmail, []);
          }
          userPlansMap.get(userEmail)!.push(plan);
        }

        // Map client info to their plans
        const plansByClient = Array.from(userPlansMap.entries()).map(([email, plans]) => {
          const client = clientsData.clients.find(
            c => c.client_email?.toLowerCase() === email.toLowerCase()
          );
          return {
            client: {
              id: client?.client_user_id || plans[0].user.id,
              name: client?.client_name || plans[0].user.name,
              email,
            },
            plans,
          };
        });

        return {
          trainer: {
            id: trainerData.id,
            businessName: trainerData.business_name,
            tenantId: trainerData.tenant_id,
          },
          plans: plansResponse.plans,
          plansByClient,
          total: plansResponse.total,
          clientCount: clientsData.clients.length,
        } as GymTrainerClientPlansResponse;
      },
      enabled: !!trainerId,
    });
  };

  // Update a plan in personal-os-console
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

  // Note: Assign and Duplicate operations require additional implementation
  // in personal-os-console to support trainer workflows
  const useAssignPlan = () => {
    return useMutation({
      mutationFn: async ({ planId, assignment }: { planId: string; assignment: { clientUserId: string } }) => {
        // TODO: Implement plan assignment in personal-os-console
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
        // TODO: Implement plan duplication in personal-os-console
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
    usePlans,
    usePlan,
    useTrainerClientPlans,

    // Mutations
    useUpdatePlan,
    useAssignPlan,
    useDuplicatePlan,
  };
};
