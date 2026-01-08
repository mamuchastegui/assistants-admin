import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthApi } from '@/hooks/useAuthApi';

// ==================== TYPES ====================

export type TrainerClientStatus = 'pending' | 'active' | 'paused' | 'ended';

export interface GymTrainer {
  id: string;
  tenant_id: string;
  user_id: string;
  business_name?: string;
  specialty?: string;
  bio?: string;
  invite_code: string;
  max_clients: number;
  instagram_handle?: string;
  website?: string;
  is_active: boolean;
  client_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface TrainerClient {
  id: string;
  trainer_id: string;
  client_user_id: string;
  status: TrainerClientStatus;
  linked_via: string;
  notes_from_trainer?: string;
  tags: string[];
  linked_at?: string;
  ended_at?: string;
  client_name?: string;
  client_email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClientProgress {
  client_user_id: string;
  total_workouts: number;
  workouts_this_week: number;
  workouts_this_month: number;
  last_workout_date?: string;
  average_rpe?: number;
  streak_days: number;
}

export interface WorkoutLog {
  id: string;
  day_name?: string;
  muscle_groups: string[];
  exercises: Array<{
    name: string;
    sets: Array<{
      reps: number;
      weight?: number;
      isWarmup?: boolean;
      notes?: string;
    }>;
    notes?: string;
  }>;
  duration_minutes?: number;
  rpe?: number;
  notes?: string;
  mood?: string;
  completed_at?: string;
  created_at?: string;
}

export interface ClientPlan {
  id: string;
  plan: {
    programName?: string;
    weeklyPlan?: Record<string, {
      dayName: string;
      muscleGroups: string[];
      warmup?: string[];
      exercises: Array<{
        name: string;
        sets: number;
        reps: string;
        restSeconds?: number;
        notes?: string;
      }>;
      estimatedDuration?: number;
      notes?: string;
    }>;
    tips?: string[];
  };
  status?: string;
  assigned_at?: string;
  created_at?: string;
}

export interface ClientListParams {
  status?: TrainerClientStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TrainerRegisterData {
  business_name?: string;
  specialty?: string;
  bio?: string;
  instagram_handle?: string;
  website?: string;
}

export interface TrainerUpdateData {
  business_name?: string;
  specialty?: string;
  bio?: string;
  max_clients?: number;
  instagram_handle?: string;
  website?: string;
  is_active?: boolean;
}

export interface ClientAddData {
  client_user_id: string;
  notes_from_trainer?: string;
  tags?: string[];
}

export interface ClientUpdateData {
  notes_from_trainer?: string;
  tags?: string[];
  status?: TrainerClientStatus;
}

// ==================== HOOK ====================

export const useGymTrainer = () => {
  const authApi = useAuthApi();
  const queryClient = useQueryClient();

  // ==================== TRAINER PROFILE ====================

  // Get trainer profile
  const useTrainerProfile = () => {
    return useQuery({
      queryKey: ['gym-trainer-profile'],
      queryFn: async () => {
        const response = await authApi.get('/api/gym/trainers/me');
        return response.data as GymTrainer;
      },
    });
  };

  // Register as trainer
  const useRegisterTrainer = () => {
    return useMutation({
      mutationFn: async (data: TrainerRegisterData) => {
        const response = await authApi.post('/api/gym/trainers/register', data);
        return response.data as GymTrainer;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gym-trainer-profile'] });
      },
    });
  };

  // Update trainer profile
  const useUpdateTrainerProfile = () => {
    return useMutation({
      mutationFn: async (data: TrainerUpdateData) => {
        const response = await authApi.put('/api/gym/trainers/me', data);
        return response.data as GymTrainer;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gym-trainer-profile'] });
      },
    });
  };

  // Regenerate invite code
  const useRegenerateInviteCode = () => {
    return useMutation({
      mutationFn: async () => {
        const response = await authApi.post('/api/gym/trainers/invite/regenerate');
        return response.data as { invite_code: string; message: string };
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gym-trainer-profile'] });
      },
    });
  };

  // ==================== CLIENT MANAGEMENT ====================

  // List clients
  const useListClients = (params: ClientListParams = {}) => {
    return useQuery({
      queryKey: ['gym-trainer-clients', params],
      queryFn: async () => {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.search) queryParams.append('search', params.search);
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.offset) queryParams.append('offset', params.offset.toString());

        const response = await authApi.get(`/api/gym/trainers/clients?${queryParams.toString()}`);
        return response.data as {
          clients: TrainerClient[];
          total: number;
          limit: number;
          offset: number;
        };
      },
    });
  };

  // Get single client
  const useGetClient = (clientId: string) => {
    return useQuery({
      queryKey: ['gym-trainer-client', clientId],
      queryFn: async () => {
        const response = await authApi.get(`/api/gym/trainers/clients/${clientId}`);
        return response.data as TrainerClient;
      },
      enabled: !!clientId,
    });
  };

  // Add client manually
  const useAddClient = () => {
    return useMutation({
      mutationFn: async (data: ClientAddData) => {
        const response = await authApi.post('/api/gym/trainers/clients', data);
        return response.data as TrainerClient;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gym-trainer-clients'] });
        queryClient.invalidateQueries({ queryKey: ['gym-trainer-profile'] });
      },
    });
  };

  // Update client
  const useUpdateClient = () => {
    return useMutation({
      mutationFn: async ({ clientId, data }: { clientId: string; data: ClientUpdateData }) => {
        const response = await authApi.put(`/api/gym/trainers/clients/${clientId}`, data);
        return response.data as TrainerClient;
      },
      onSuccess: (_, { clientId }) => {
        queryClient.invalidateQueries({ queryKey: ['gym-trainer-client', clientId] });
        queryClient.invalidateQueries({ queryKey: ['gym-trainer-clients'] });
      },
    });
  };

  // Remove client
  const useRemoveClient = () => {
    return useMutation({
      mutationFn: async (clientId: string) => {
        const response = await authApi.delete(`/api/gym/trainers/clients/${clientId}`);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gym-trainer-clients'] });
        queryClient.invalidateQueries({ queryKey: ['gym-trainer-profile'] });
      },
    });
  };

  // ==================== CLIENT PROGRESS ====================

  // Get client progress stats
  const useClientProgress = (clientId: string) => {
    return useQuery({
      queryKey: ['gym-trainer-client-progress', clientId],
      queryFn: async () => {
        const response = await authApi.get(`/api/gym/trainers/clients/${clientId}/progress`);
        return response.data as ClientProgress;
      },
      enabled: !!clientId,
    });
  };

  // Get client workout logs
  const useClientWorkouts = (clientId: string, limit: number = 20, offset: number = 0) => {
    return useQuery({
      queryKey: ['gym-trainer-client-workouts', clientId, limit, offset],
      queryFn: async () => {
        const response = await authApi.get(
          `/api/gym/trainers/clients/${clientId}/workouts?limit=${limit}&offset=${offset}`
        );
        return response.data as {
          logs: WorkoutLog[];
          total: number;
        };
      },
      enabled: !!clientId,
    });
  };

  // ==================== PLAN ASSIGNMENT ====================

  // Get client's assigned plans
  const useClientPlans = (clientId: string) => {
    return useQuery({
      queryKey: ['gym-trainer-client-plans', clientId],
      queryFn: async () => {
        const response = await authApi.get(`/api/gym/trainers/clients/${clientId}/plans`);
        return response.data as {
          plans: ClientPlan[];
        };
      },
      enabled: !!clientId,
    });
  };

  // Assign plan to client
  const useAssignPlan = () => {
    return useMutation({
      mutationFn: async ({ clientId, planId }: { clientId: string; planId: string }) => {
        const response = await authApi.post(`/api/gym/trainers/clients/${clientId}/plans`, {
          plan_id: planId,
        });
        return response.data as ClientPlan;
      },
      onSuccess: (_, { clientId }) => {
        queryClient.invalidateQueries({ queryKey: ['gym-trainer-client-plans', clientId] });
      },
    });
  };

  return {
    // Trainer profile
    useTrainerProfile,
    useRegisterTrainer,
    useUpdateTrainerProfile,
    useRegenerateInviteCode,
    // Client management
    useListClients,
    useGetClient,
    useAddClient,
    useUpdateClient,
    useRemoveClient,
    // Client progress
    useClientProgress,
    useClientWorkouts,
    // Plan assignment
    useClientPlans,
    useAssignPlan,
  };
};
