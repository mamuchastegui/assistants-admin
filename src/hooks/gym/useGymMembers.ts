import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthApi } from '@/api/client';

export interface GymMember {
  member_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  status: 'active' | 'inactive' | 'suspended' | 'expired' | 'pending';
  membership_plan_id?: string;
  membership_start_date?: string;
  membership_end_date?: string;
  is_active: boolean;
  days_until_expiration?: number;
  address?: string;
  city?: string;
  postal_code?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medical_conditions: string[];
  fitness_goals: string[];
  registration_date?: string;
  last_check_in?: string;
  total_check_ins: number;
  notes?: string;
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

export interface MemberListParams {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface MembershipUpdateData {
  plan_id: string;
  start_date: string;
  end_date: string;
}

export interface MemberCreateData {
  user_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  status?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medical_conditions?: string[];
  fitness_goals?: string[];
  notes?: string;
  tags?: string[];
}

export const useGymMembers = () => {
  const authApi = useAuthApi();
  const queryClient = useQueryClient();

  // List members
  const useListMembers = (params: MemberListParams = {}) => {
    return useQuery({
      queryKey: ['gym-members', params],
      queryFn: async () => {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.search) queryParams.append('search', params.search);
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.offset) queryParams.append('offset', params.offset.toString());

        const response = await authApi.get(`/api/gym/members?${queryParams.toString()}`);
        return response.data;
      },
    });
  };

  // Get member by ID
  const useGetMember = (memberId: string) => {
    return useQuery({
      queryKey: ['gym-member', memberId],
      queryFn: async () => {
        const response = await authApi.get(`/api/gym/members/${memberId}`);
        return response.data;
      },
      enabled: !!memberId,
    });
  };

  // Get expiring memberships
  const useExpiringMemberships = (daysAhead: number = 7) => {
    return useQuery({
      queryKey: ['gym-members-expiring', daysAhead],
      queryFn: async () => {
        const response = await authApi.get(`/api/gym/members/expiring?days_ahead=${daysAhead}`);
        return response.data;
      },
    });
  };

  // Get members by tag
  const useMembersByTag = (tag: string) => {
    return useQuery({
      queryKey: ['gym-members-by-tag', tag],
      queryFn: async () => {
        const response = await authApi.get(`/api/gym/members/by-tag/${tag}`);
        return response.data;
      },
      enabled: !!tag,
    });
  };

  // Create member
  const useCreateMember = () => {
    return useMutation({
      mutationFn: async (data: MemberCreateData) => {
        const response = await authApi.post('/api/gym/members', data);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gym-members'] });
      },
    });
  };

  // Update member
  const useUpdateMember = () => {
    return useMutation({
      mutationFn: async ({ memberId, data }: { memberId: string; data: Partial<MemberCreateData> }) => {
        const response = await authApi.put(`/api/gym/members/${memberId}`, data);
        return response.data;
      },
      onSuccess: (_, { memberId }) => {
        queryClient.invalidateQueries({ queryKey: ['gym-member', memberId] });
        queryClient.invalidateQueries({ queryKey: ['gym-members'] });
      },
    });
  };

  // Delete member
  const useDeleteMember = () => {
    return useMutation({
      mutationFn: async (memberId: string) => {
        const response = await authApi.delete(`/api/gym/members/${memberId}`);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gym-members'] });
      },
    });
  };

  // Update membership
  const useUpdateMembership = () => {
    return useMutation({
      mutationFn: async ({ memberId, data }: { memberId: string; data: MembershipUpdateData }) => {
        const response = await authApi.post(`/api/gym/members/${memberId}/membership`, data);
        return response.data;
      },
      onSuccess: (_, { memberId }) => {
        queryClient.invalidateQueries({ queryKey: ['gym-member', memberId] });
        queryClient.invalidateQueries({ queryKey: ['gym-members'] });
      },
    });
  };

  // Suspend membership
  const useSuspendMembership = () => {
    return useMutation({
      mutationFn: async ({ memberId, reason }: { memberId: string; reason?: string }) => {
        const response = await authApi.post(`/api/gym/members/${memberId}/suspend`, { reason });
        return response.data;
      },
      onSuccess: (_, { memberId }) => {
        queryClient.invalidateQueries({ queryKey: ['gym-member', memberId] });
        queryClient.invalidateQueries({ queryKey: ['gym-members'] });
      },
    });
  };

  // Reactivate membership
  const useReactivateMembership = () => {
    return useMutation({
      mutationFn: async (memberId: string) => {
        const response = await authApi.post(`/api/gym/members/${memberId}/reactivate`);
        return response.data;
      },
      onSuccess: (_, memberId) => {
        queryClient.invalidateQueries({ queryKey: ['gym-member', memberId] });
        queryClient.invalidateQueries({ queryKey: ['gym-members'] });
      },
    });
  };

  // Record check-in
  const useRecordCheckIn = () => {
    return useMutation({
      mutationFn: async (memberId: string) => {
        const response = await authApi.post(`/api/gym/members/${memberId}/checkin`);
        return response.data;
      },
      onSuccess: (_, memberId) => {
        queryClient.invalidateQueries({ queryKey: ['gym-member', memberId] });
        queryClient.invalidateQueries({ queryKey: ['gym-members'] });
      },
    });
  };

  return {
    useListMembers,
    useGetMember,
    useExpiringMemberships,
    useMembersByTag,
    useCreateMember,
    useUpdateMember,
    useDeleteMember,
    useUpdateMembership,
    useSuspendMembership,
    useReactivateMembership,
    useRecordCheckIn,
  };
};