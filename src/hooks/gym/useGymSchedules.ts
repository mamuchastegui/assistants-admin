import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthApi } from '@/api/client';

// Types
export interface GymSchedule {
  id: string;
  class_id: string;
  class_name?: string;
  day_of_week: number;
  day_name?: string;
  start_time: string;
  end_time: string;
  room?: string;
  instructor?: string;
  capacity: number;
  is_active: boolean;
  valid_from?: string;
  valid_until?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateScheduleInput {
  class_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room?: string;
  override_capacity?: number;
  override_instructor?: string;
  valid_from?: string;
  valid_until?: string;
}

export interface UpdateScheduleInput extends Partial<CreateScheduleInput> {
  is_active?: boolean;
}

export interface ListSchedulesParams {
  day_of_week?: number;
  class_id?: string;
  include_inactive?: boolean;
}

export interface GymScheduleListResponse {
  schedules: GymSchedule[];
  total: number;
}

export interface ScheduleAvailability {
  schedule_id: string;
  date: string;
  available_spots: number;
  max_capacity: number;
  booked_count: number;
  attendees: Array<{
    member_id: string;
    member_name: string;
    status: string;
  }>;
}

// Query keys
const SCHEDULES_QUERY_KEY = ['gym', 'schedules'];

export const useGymSchedules = () => {
  const authApi = useAuthApi();
  const queryClient = useQueryClient();

  // List schedules
  const useListSchedules = (params?: ListSchedulesParams) => {
    return useQuery({
      queryKey: [...SCHEDULES_QUERY_KEY, 'list', params],
      queryFn: async () => {
        const queryParams = new URLSearchParams();
        if (params?.day_of_week !== undefined) queryParams.append('day_of_week', params.day_of_week.toString());
        if (params?.class_id) queryParams.append('class_id', params.class_id);
        if (params?.include_inactive) queryParams.append('include_inactive', 'true');

        const response = await authApi.get(`/api/gym/schedules?${queryParams.toString()}`);
        return response.data as GymScheduleListResponse;
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Get single schedule
  const useGetSchedule = (scheduleId: string, enabled = true) => {
    return useQuery({
      queryKey: [...SCHEDULES_QUERY_KEY, scheduleId],
      queryFn: async () => {
        const response = await authApi.get(`/api/gym/schedules/${scheduleId}`);
        return response.data as GymSchedule;
      },
      enabled: enabled && !!scheduleId,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Check availability for a schedule on a specific date
  const useScheduleAvailability = (scheduleId: string, date: string, enabled = true) => {
    return useQuery({
      queryKey: [...SCHEDULES_QUERY_KEY, scheduleId, 'availability', date],
      queryFn: async () => {
        const response = await authApi.get(`/api/gym/schedules/${scheduleId}/availability?date=${date}`);
        return response.data as ScheduleAvailability;
      },
      enabled: enabled && !!scheduleId && !!date,
      staleTime: 1 * 60 * 1000, // 1 minute for availability
    });
  };

  // Create schedule
  const useCreateSchedule = () => {
    return useMutation({
      mutationFn: async (data: CreateScheduleInput) => {
        const response = await authApi.post('/api/gym/schedules', data);
        return response.data as GymSchedule;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: SCHEDULES_QUERY_KEY });
        toast.success(`Horario creado: ${data.class_name} - ${data.day_name} ${data.start_time}`);
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Error al crear el horario';
        toast.error(message);
      },
    });
  };

  // Update schedule
  const useUpdateSchedule = () => {
    return useMutation({
      mutationFn: async ({ scheduleId, data }: { scheduleId: string; data: UpdateScheduleInput }) => {
        const response = await authApi.put(`/api/gym/schedules/${scheduleId}`, data);
        return response.data as GymSchedule;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [...SCHEDULES_QUERY_KEY, data.id] });
        queryClient.invalidateQueries({ queryKey: [...SCHEDULES_QUERY_KEY, 'list'] });
        toast.success('Horario actualizado exitosamente');
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Error al actualizar el horario';
        toast.error(message);
      },
    });
  };

  // Delete schedule
  const useDeleteSchedule = () => {
    return useMutation({
      mutationFn: async (scheduleId: string) => {
        const response = await authApi.delete(`/api/gym/schedules/${scheduleId}`);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: SCHEDULES_QUERY_KEY });
        toast.success('Horario desactivado exitosamente');
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Error al desactivar el horario';
        toast.error(message);
      },
    });
  };

  return {
    // Queries
    useListSchedules,
    useGetSchedule,
    useScheduleAvailability,
    // Mutations
    useCreateSchedule,
    useUpdateSchedule,
    useDeleteSchedule,
  };
};
