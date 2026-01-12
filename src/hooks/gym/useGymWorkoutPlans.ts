/**
 * Hook for managing workout plans from gym.condamind.com (personal-os-console)
 * Uses two APIs:
 * - assistants-api: Get trainer's clients list (with emails)
 * - personal-os-console: Get workout plans by user emails
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthApi } from '@/api/client';
import { gymConsoleClient, type GymWorkoutPlan, type GymPlanUpdate } from '@/api/gymConsoleClient';
import { toast } from 'sonner';

// Re-export types from gymConsoleClient for convenience
export type { GymWorkoutPlan, GymPlanUpdate };
export type { GymPlanContent, GymWorkoutDay, GymExercise, GymPlansListResponse } from '@/api/gymConsoleClient';

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

  // Get all plans for current trainer's clients
  // This fetches clients from assistants-api, then their plans from personal-os-console
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
        // Step 1: Get trainer's clients from assistants-api
        const { data: clientsData } = await authApi.get<ClientListResponse>(
          '/api/gym/trainers/clients',
          {
            params: {
              status: 'active',
              limit: 500,
            },
          }
        );

        const clientEmails = clientsData.clients
          .map(c => c.client_email)
          .filter((email): email is string => !!email);

        if (clientEmails.length === 0) {
          return { plans: [], total: 0 };
        }

        // Step 2: Get plans from personal-os-console by client emails
        const plansResponse = await gymConsoleClient.getPlans({
          emails: clientEmails,
          status: filters?.status,
          limit: filters?.limit,
          offset: filters?.offset,
        });

        return plansResponse;
      },
      enabled: true, // Always enabled since we get trainer from /me endpoint
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
  const useTrainerClientPlans = (trainerId: string, filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    return useQuery({
      queryKey: [...GYM_PLANS_QUERY_KEY, 'trainer', trainerId, 'clients', filters],
      queryFn: async () => {
        // Step 1: Get trainer info
        const { data: trainerData } = await authApi.get('/api/gym/trainers/me');

        // Step 2: Get trainer's clients
        const { data: clientsData } = await authApi.get<ClientListResponse>(
          '/api/gym/trainers/clients',
          {
            params: {
              status: 'active',
              limit: 500,
            },
          }
        );

        const clients = clientsData.clients.filter(c => c.client_email);

        if (clients.length === 0) {
          return {
            trainer: {
              id: trainerData.id,
              businessName: trainerData.business_name,
              tenantId: trainerData.tenant_id,
            },
            plans: [],
            plansByClient: [],
            total: 0,
            clientCount: 0,
          };
        }

        // Step 3: Get plans from personal-os-console
        const clientEmails = clients.map(c => c.client_email!);
        const plansResponse = await gymConsoleClient.getPlans({
          emails: clientEmails,
          status: filters?.status,
          limit: filters?.limit || 100,
          offset: filters?.offset,
        });

        // Step 4: Group plans by client
        const plansByClient = clients.map(client => {
          const clientPlans = plansResponse.plans.filter(
            p => p.user.email.toLowerCase() === client.client_email?.toLowerCase()
          );
          return {
            client: {
              id: client.client_user_id,
              name: client.client_name,
              email: client.client_email!,
            },
            plans: clientPlans,
          };
        }).filter(group => group.plans.length > 0);

        return {
          trainer: {
            id: trainerData.id,
            businessName: trainerData.business_name,
            tenantId: trainerData.tenant_id,
          },
          plans: plansResponse.plans,
          plansByClient,
          total: plansResponse.total,
          clientCount: clients.length,
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
