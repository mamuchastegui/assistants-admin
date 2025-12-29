import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthApi } from '@/hooks/useAuthApi';
import { toast } from 'sonner';

// Types matching backend
export interface WorkoutPlan {
  plan_id: string;
  name: string;
  description?: string;
  goal?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration_weeks: number;
  sessions_per_week: number;
  status: 'draft' | 'active' | 'completed' | 'paused' | 'archived';
  created_by?: string;
  member_id?: string;
  member_name?: string;
  start_date?: string;
  end_date?: string;
  total_sessions: number;
  completed_sessions: number;
  completion_percentage: number;
  current_week: number;
  is_template: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface WorkoutSession {
  session_id: string;
  plan_id: string;
  name: string;
  description?: string;
  day_of_week?: number;
  week_number?: number;
  session_type: string;
  focus_areas: string[];
  scheduled_date?: string;
  completed_date?: string;
  completion_percentage: number;
  duration_minutes: number;
  total_exercises: number;
  total_weight_lifted?: number;
  notes?: string;
  rating?: number;
}

export interface WorkoutExercise {
  workout_exercise_id: string;
  session_id: string;
  exercise_id: string;
  exercise_name: string;
  muscle_groups: string[];
  order_index: number;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  rest_seconds?: number;
  duration_minutes?: number;
  distance_km?: number;
  notes?: string;
}

export interface ExerciseLog {
  log_id: string;
  exercise_id: string;
  exercise_name: string;
  session_id?: string;
  member_id: string;
  date: string;
  sets_completed: number;
  reps: number[];
  weight_kg: number[];
  total_volume: number;
  difficulty_rating?: number;
  notes?: string;
  personal_record: boolean;
  created_at: string;
}

export interface PlanCreate {
  name: string;
  description?: string;
  goal?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration_weeks: number;
  sessions_per_week: number;
  created_by?: string;
  member_id?: string;
  is_template: boolean;
  tags: string[];
  sessions: SessionCreate[];
}

export interface SessionCreate {
  name: string;
  description?: string;
  day_of_week?: number;
  week_number?: number;
  session_type: string;
  focus_areas: string[];
  warmup_minutes?: number;
  cooldown_minutes?: number;
  exercises: ExerciseCreate[];
}

export interface ExerciseCreate {
  exercise_id: string;
  order_index: number;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  rest_seconds?: number;
  duration_minutes?: number;
  distance_km?: number;
  notes?: string;
}

const PLANS_QUERY_KEY = ['gym', 'workout-plans'];

export const useWorkoutPlans = () => {
  const queryClient = useQueryClient();
  const authApi = useAuthApi();

  // Get all plans
  const usePlans = (filters?: {
    member_id?: string;
    is_template?: boolean;
    status?: string;
  }) => {
    return useQuery({
      queryKey: [...PLANS_QUERY_KEY, 'list', filters],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (filters?.member_id) params.append('member_id', filters.member_id);
        if (filters?.is_template !== undefined) params.append('is_template', String(filters.is_template));
        if (filters?.status) params.append('status', filters.status);

        const { data } = await authApi.get(`/gym/workouts/plans?${params}`);
        return data as WorkoutPlan[];
      },
    });
  };

  // Get single plan
  const usePlan = (planId: string) => {
    return useQuery({
      queryKey: [...PLANS_QUERY_KEY, planId],
      queryFn: async () => {
        const { data } = await authApi.get(`/gym/workouts/plans/${planId}`);
        return data as WorkoutPlan;
      },
      enabled: !!planId,
    });
  };

  // Get plan sessions
  const usePlanSessions = (planId: string) => {
    return useQuery({
      queryKey: [...PLANS_QUERY_KEY, planId, 'sessions'],
      queryFn: async () => {
        const { data } = await authApi.get(`/gym/workouts/plans/${planId}/sessions`);
        return data as WorkoutSession[];
      },
      enabled: !!planId,
    });
  };

  // Create plan
  const useCreatePlan = () => {
    return useMutation({
      mutationFn: async (plan: PlanCreate) => {
        const { data } = await authApi.post('/gym/workouts/plans', plan);
        return data as WorkoutPlan;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
        toast.success('Plan de entrenamiento creado');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Error al crear plan');
      },
    });
  };

  // Update plan
  const useUpdatePlan = () => {
    return useMutation({
      mutationFn: async ({ planId, updates }: { planId: string; updates: Partial<WorkoutPlan> }) => {
        const { data } = await authApi.put(`/gym/workouts/plans/${planId}`, updates);
        return data as WorkoutPlan;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [...PLANS_QUERY_KEY, data.plan_id] });
        queryClient.invalidateQueries({ queryKey: [...PLANS_QUERY_KEY, 'list'] });
        toast.success('Plan actualizado');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Error al actualizar plan');
      },
    });
  };

  // Delete plan
  const useDeletePlan = () => {
    return useMutation({
      mutationFn: async (planId: string) => {
        await authApi.delete(`/gym/workouts/plans/${planId}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
        toast.success('Plan eliminado');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Error al eliminar plan');
      },
    });
  };

  // Assign plan to member
  const useAssignPlan = () => {
    return useMutation({
      mutationFn: async ({ planId, memberId, startDate }: {
        planId: string;
        memberId: string;
        startDate?: string;
      }) => {
        const { data } = await authApi.post(`/gym/workouts/plans/${planId}/assign`, {
          member_id: memberId,
          start_date: startDate,
        });
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
        toast.success('Plan asignado al miembro');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Error al asignar plan');
      },
    });
  };

  // Duplicate plan
  const useDuplicatePlan = () => {
    return useMutation({
      mutationFn: async ({ planId, newName, memberId }: {
        planId: string;
        newName: string;
        memberId?: string;
      }) => {
        const params = new URLSearchParams({ new_name: newName });
        if (memberId) params.append('member_id', memberId);

        const { data } = await authApi.post(`/gym/workouts/plans/${planId}/duplicate?${params}`);
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
        toast.success('Plan duplicado');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Error al duplicar plan');
      },
    });
  };

  // Complete session
  const useCompleteSession = () => {
    return useMutation({
      mutationFn: async ({
        sessionId,
        data
      }: {
        sessionId: string;
        data: {
          completion_percentage: number;
          total_weight_lifted?: number;
          notes?: string;
          rating?: number;
          exercises_completed: Array<{
            exercise_id: string;
            exercise_name: string;
            sets_completed: number;
            reps: number[];
            weight_kg: number[];
            notes?: string;
          }>;
        };
      }) => {
        const response = await authApi.post(`/gym/workouts/sessions/${sessionId}/complete`, data);
        return response.data as WorkoutSession;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [...PLANS_QUERY_KEY, data.plan_id, 'sessions'] });
        toast.success('Sesión completada');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Error al completar sesión');
      },
    });
  };

  // Get member's active plan
  const useMemberActivePlan = (memberId: string) => {
    return useQuery({
      queryKey: [...PLANS_QUERY_KEY, 'member', memberId, 'active'],
      queryFn: async () => {
        const { data } = await authApi.get(`/gym/workouts/me/active`);
        return data as WorkoutPlan | null;
      },
      enabled: !!memberId,
    });
  };

  // Get member's upcoming sessions
  const useMemberUpcomingSessions = (memberId: string, days: number = 7) => {
    return useQuery({
      queryKey: [...PLANS_QUERY_KEY, 'member', memberId, 'upcoming', days],
      queryFn: async () => {
        const { data } = await authApi.get(`/gym/workouts/me/upcoming?days=${days}`);
        return data as WorkoutSession[];
      },
      enabled: !!memberId,
    });
  };

  // Get member's workout history
  const useMemberHistory = (memberId: string, startDate?: string, endDate?: string) => {
    return useQuery({
      queryKey: [...PLANS_QUERY_KEY, 'member', memberId, 'history', startDate, endDate],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        const { data } = await authApi.get(`/gym/workouts/me/history?${params}`);
        return data as WorkoutSession[];
      },
      enabled: !!memberId,
    });
  };

  // Get exercise history
  const useExerciseHistory = (exerciseId: string, limit: number = 50) => {
    return useQuery({
      queryKey: [...PLANS_QUERY_KEY, 'exercises', exerciseId, 'history', limit],
      queryFn: async () => {
        const { data } = await authApi.get(`/gym/workouts/exercises/${exerciseId}/history?limit=${limit}`);
        return data as ExerciseLog[];
      },
      enabled: !!exerciseId,
    });
  };

  // Get personal records
  const usePersonalRecords = () => {
    return useQuery({
      queryKey: [...PLANS_QUERY_KEY, 'personal-records'],
      queryFn: async () => {
        const { data } = await authApi.get('/gym/workouts/me/personal-records');
        return data;
      },
    });
  };

  // Get workout stats
  const useWorkoutStats = (periodDays: number = 30) => {
    return useQuery({
      queryKey: [...PLANS_QUERY_KEY, 'stats', periodDays],
      queryFn: async () => {
        const { data } = await authApi.get(`/gym/workouts/me/stats?period=${periodDays}`);
        return data;
      },
    });
  };

  return {
    // Queries
    usePlans,
    usePlan,
    usePlanSessions,
    useMemberActivePlan,
    useMemberUpcomingSessions,
    useMemberHistory,
    useExerciseHistory,
    usePersonalRecords,
    useWorkoutStats,

    // Mutations
    useCreatePlan,
    useUpdatePlan,
    useDeletePlan,
    useAssignPlan,
    useDuplicatePlan,
    useCompleteSession,
  };
};