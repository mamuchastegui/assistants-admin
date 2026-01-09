import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthApi } from '@/api/client';

// Types
export interface GymBooking {
  id: string;
  user_id: string;
  schedule_id: string;
  class_id: string;
  class_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'cancelled' | 'attended' | 'no_show' | 'waitlist';
  instructor?: string;
  room?: string;
  member_name?: string;
  notes?: string;
  reminder_hours_before: number;
  reminder_scheduled_at?: string;
  reminder_sent: boolean;
  is_cancellable: boolean;
  created_at?: string;
}

export interface CreateBookingInput {
  schedule_id: string;
  booking_date: string;
  member_id: string;
  notes?: string;
  schedule_reminder?: boolean;
  reminder_hours_before?: number;
}

export interface UpdateBookingInput {
  notes?: string;
  status?: GymBooking['status'];
}

export interface ListBookingsParams {
  date_from?: string;
  date_to?: string;
  status?: GymBooking['status'];
  schedule_id?: string;
  member_id?: string;
  limit?: number;
  offset?: number;
}

export interface GymBookingListResponse {
  bookings: GymBooking[];
  total: number;
}

// Query keys
const BOOKINGS_QUERY_KEY = ['gym', 'bookings'];
const SCHEDULES_QUERY_KEY = ['gym', 'schedules'];

export const useGymBookings = () => {
  const authApi = useAuthApi();
  const queryClient = useQueryClient();

  // List bookings
  const useListBookings = (params?: ListBookingsParams) => {
    return useQuery({
      queryKey: [...BOOKINGS_QUERY_KEY, 'list', params],
      queryFn: async () => {
        const queryParams = new URLSearchParams();
        if (params?.date_from) queryParams.append('date_from', params.date_from);
        if (params?.date_to) queryParams.append('date_to', params.date_to);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.schedule_id) queryParams.append('schedule_id', params.schedule_id);
        if (params?.member_id) queryParams.append('member_id', params.member_id);
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());

        const response = await authApi.get(`/api/gym/bookings?${queryParams.toString()}`);
        return response.data as GymBookingListResponse;
      },
      staleTime: 1 * 60 * 1000, // 1 minute
    });
  };

  // Get single booking
  const useGetBooking = (bookingId: string, enabled = true) => {
    return useQuery({
      queryKey: [...BOOKINGS_QUERY_KEY, bookingId],
      queryFn: async () => {
        const response = await authApi.get(`/api/gym/bookings/${bookingId}`);
        return response.data as GymBooking;
      },
      enabled: enabled && !!bookingId,
      staleTime: 2 * 60 * 1000,
    });
  };

  // Create booking (admin books member into class)
  const useCreateBooking = () => {
    return useMutation({
      mutationFn: async (data: CreateBookingInput) => {
        const response = await authApi.post('/api/gym/bookings', data);
        return response.data as GymBooking;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
        // Also invalidate schedule availability
        queryClient.invalidateQueries({ queryKey: [...SCHEDULES_QUERY_KEY, data.schedule_id, 'availability'] });
        toast.success(`Reserva creada para ${data.member_name || 'miembro'}`);
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Error al crear la reserva';
        toast.error(message);
      },
    });
  };

  // Update booking
  const useUpdateBooking = () => {
    return useMutation({
      mutationFn: async ({ bookingId, data }: { bookingId: string; data: UpdateBookingInput }) => {
        const response = await authApi.put(`/api/gym/bookings/${bookingId}`, data);
        return response.data as GymBooking;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [...BOOKINGS_QUERY_KEY, data.id] });
        queryClient.invalidateQueries({ queryKey: [...BOOKINGS_QUERY_KEY, 'list'] });
        toast.success('Reserva actualizada');
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Error al actualizar la reserva';
        toast.error(message);
      },
    });
  };

  // Cancel booking
  const useCancelBooking = () => {
    return useMutation({
      mutationFn: async ({ bookingId, reason }: { bookingId: string; reason?: string }) => {
        const queryParams = reason ? `?reason=${encodeURIComponent(reason)}` : '';
        const response = await authApi.delete(`/api/gym/bookings/${bookingId}${queryParams}`);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: SCHEDULES_QUERY_KEY });
        toast.success('Reserva cancelada');
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Error al cancelar la reserva';
        toast.error(message);
      },
    });
  };

  // Mark attendance (attended or no_show)
  const useMarkAttendance = () => {
    return useMutation({
      mutationFn: async ({ bookingId, status }: { bookingId: string; status: 'attended' | 'no_show' }) => {
        const response = await authApi.post(`/api/gym/bookings/${bookingId}/mark-attended`, { status });
        return response.data;
      },
      onSuccess: (_, { status }) => {
        queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
        const message = status === 'attended' ? 'Asistencia registrada' : 'Marcado como ausente';
        toast.success(message);
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Error al registrar asistencia';
        toast.error(message);
      },
    });
  };

  // Schedule reminder
  const useScheduleReminder = () => {
    return useMutation({
      mutationFn: async ({ bookingId, hoursBefore }: { bookingId: string; hoursBefore: number }) => {
        const response = await authApi.post(`/api/gym/bookings/${bookingId}/schedule-reminder`, {
          hours_before: hoursBefore,
        });
        return response.data;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
        toast.success('Recordatorio programado');
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Error al programar recordatorio';
        toast.error(message);
      },
    });
  };

  return {
    // Queries
    useListBookings,
    useGetBooking,
    // Mutations
    useCreateBooking,
    useUpdateBooking,
    useCancelBooking,
    useMarkAttendance,
    useScheduleReminder,
  };
};
