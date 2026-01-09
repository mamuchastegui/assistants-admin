import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthApi } from '@/api/client';

// Types
export interface GymCheckIn {
  checkin_id: string;
  member_id: string;
  member_name?: string;
  check_in_time: string;
  check_out_time?: string;
  duration_minutes?: number;
  check_in_method: string;
  notes?: string;
}

export interface CheckInStats {
  total_checkins: number;
  unique_members: number;
  average_duration_minutes: number;
  peak_hour: number;
  busiest_day: string;
  checkins_by_hour: Record<string, number>;
  checkins_by_day: Record<string, number>;
  checkins_by_method: Record<string, number>;
}

export interface MemberFrequency {
  total_visits: number;
  unique_days: number;
  visits_per_week: number;
  avg_duration_minutes: number;
  preferred_day?: string;
  preferred_hour?: number;
  current_streak: number;
}

export interface PeakHour {
  hour: number;
  total_checkins: number;
  unique_members: number;
  avg_per_day: number;
}

export interface TodaySummary {
  date: string;
  total_checkins: number;
  unique_members: number;
  currently_active: number;
  average_duration: number;
}

export interface CheckInValidation {
  can_checkin: boolean;
  reason?: string;
}

// Query keys
const CHECKINS_QUERY_KEY = ['gym', 'checkins'];

export const useGymCheckIns = () => {
  const authApi = useAuthApi();
  const queryClient = useQueryClient();

  // Get active check-ins
  const useActiveCheckIns = () => {
    return useQuery({
      queryKey: [...CHECKINS_QUERY_KEY, 'active'],
      queryFn: async () => {
        const response = await authApi.get('/api/gym/checkins/active');
        return response.data as GymCheckIn[];
      },
      refetchInterval: 30000, // Refresh every 30 seconds
      staleTime: 10000, // Consider data stale after 10 seconds
    });
  };

  // Get check-ins by date
  const useCheckInsByDate = (date: string) => {
    return useQuery({
      queryKey: [...CHECKINS_QUERY_KEY, 'date', date],
      queryFn: async () => {
        const response = await authApi.get(`/api/gym/checkins/date/${date}`);
        return response.data as GymCheckIn[];
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  // Get member check-ins
  const useMemberCheckIns = (memberId: string, startDate?: string, endDate?: string) => {
    return useQuery({
      queryKey: [...CHECKINS_QUERY_KEY, 'member', memberId, startDate, endDate],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        const response = await authApi.get(
          `/api/gym/checkins/member/${memberId}?${params.toString()}`
        );
        return response.data as GymCheckIn[];
      },
      enabled: !!memberId,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Get check-in stats
  const useCheckInStats = (startDate: string, endDate: string) => {
    return useQuery({
      queryKey: [...CHECKINS_QUERY_KEY, 'stats', startDate, endDate],
      queryFn: async () => {
        const response = await authApi.get(
          `/api/gym/checkins/stats?start_date=${startDate}&end_date=${endDate}`
        );
        return response.data as CheckInStats;
      },
      staleTime: 10 * 60 * 1000,
    });
  };

  // Get member frequency
  const useMemberFrequency = (memberId: string, days = 30) => {
    return useQuery({
      queryKey: [...CHECKINS_QUERY_KEY, 'frequency', memberId, days],
      queryFn: async () => {
        const response = await authApi.get(
          `/api/gym/checkins/member/${memberId}/frequency?days=${days}`
        );
        return response.data as MemberFrequency;
      },
      enabled: !!memberId,
      staleTime: 10 * 60 * 1000,
    });
  };

  // Get peak hours
  const usePeakHours = (days = 7) => {
    return useQuery({
      queryKey: [...CHECKINS_QUERY_KEY, 'peak-hours', days],
      queryFn: async () => {
        const response = await authApi.get(`/api/gym/checkins/peak-hours?days=${days}`);
        return response.data as PeakHour[];
      },
      staleTime: 30 * 60 * 1000,
    });
  };

  // Get today's summary
  const useTodaySummary = () => {
    return useQuery({
      queryKey: [...CHECKINS_QUERY_KEY, 'today'],
      queryFn: async () => {
        const response = await authApi.get('/api/gym/checkins/today');
        return response.data as TodaySummary;
      },
      refetchInterval: 60000, // Refresh every minute
      staleTime: 30000,
    });
  };

  // Validate member check-in
  const useValidateCheckIn = (memberId: string) => {
    return useQuery({
      queryKey: [...CHECKINS_QUERY_KEY, 'validate', memberId],
      queryFn: async () => {
        const response = await authApi.get(`/api/gym/checkins/validate/${memberId}`);
        return response.data as CheckInValidation;
      },
      enabled: !!memberId,
      staleTime: 1000, // Very short cache for validation
    });
  };

  // Create check-in
  const useCreateCheckIn = () => {
    return useMutation({
      mutationFn: async (data: {
        member_id: string;
        method?: string;
        notes?: string;
      }) => {
        const response = await authApi.post('/api/gym/checkins/', {
          member_id: data.member_id,
          method: data.method || 'manual',
          notes: data.notes,
        });
        return response.data as GymCheckIn;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [...CHECKINS_QUERY_KEY, 'active'] });
        queryClient.invalidateQueries({ queryKey: [...CHECKINS_QUERY_KEY, 'today'] });
        queryClient.invalidateQueries({
          queryKey: [...CHECKINS_QUERY_KEY, 'member', data.member_id]
        });
        toast.success(`Check-in registered for ${data.member_name || 'member'}`);
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Failed to create check-in';
        toast.error(message);
      },
    });
  };

  // Check out
  const useCheckOut = () => {
    return useMutation({
      mutationFn: async (checkinId: string) => {
        const response = await authApi.post('/api/gym/checkins/checkout', {
          checkin_id: checkinId,
        });
        return response.data as GymCheckIn;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [...CHECKINS_QUERY_KEY, 'active'] });
        queryClient.invalidateQueries({ queryKey: [...CHECKINS_QUERY_KEY, 'today'] });
        const duration = data.duration_minutes
          ? `Duration: ${Math.round(data.duration_minutes)} minutes`
          : '';
        toast.success(`Checked out ${data.member_name || 'member'}. ${duration}`);
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Failed to check out';
        toast.error(message);
      },
    });
  };

  // Auto checkout expired
  const useAutoCheckout = () => {
    return useMutation({
      mutationFn: async (hours = 12) => {
        const response = await authApi.post(`/api/gym/checkins/auto-checkout?hours=${hours}`);
        return response.data;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [...CHECKINS_QUERY_KEY, 'active'] });
        queryClient.invalidateQueries({ queryKey: [...CHECKINS_QUERY_KEY, 'today'] });
        toast.success(data.message);
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Failed to auto-checkout';
        toast.error(message);
      },
    });
  };

  // Quick check-in (validates and creates in one call)
  const useQuickCheckIn = () => {
    return useMutation({
      mutationFn: async (memberId: string) => {
        // First validate
        const validationResponse = await authApi.get(
          `/api/gym/checkins/validate/${memberId}`
        );
        const validation = validationResponse.data as CheckInValidation;

        if (!validation.can_checkin) {
          throw new Error(validation.reason || 'Member cannot check in');
        }

        // Then create check-in
        const response = await authApi.post('/api/gym/checkins/', {
          member_id: memberId,
          method: 'manual',
        });
        return response.data as GymCheckIn;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: CHECKINS_QUERY_KEY });
        toast.success(`✓ Checked in ${data.member_name || 'member'}`);
      },
      onError: (error: any) => {
        const message = error.message || error.response?.data?.detail || 'Check-in failed';
        toast.error(message);
      },
    });
  };

  return {
    // Queries
    useActiveCheckIns,
    useCheckInsByDate,
    useMemberCheckIns,
    useCheckInStats,
    useMemberFrequency,
    usePeakHours,
    useTodaySummary,
    useValidateCheckIn,
    // Mutations
    useCreateCheckIn,
    useCheckOut,
    useAutoCheckout,
    useQuickCheckIn,
  };
};