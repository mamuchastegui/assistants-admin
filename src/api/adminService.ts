import { useAuthApi } from "./client";

export interface UserStats {
  user_id: string;
  email: string | null;
  phone_number: string | null;
  is_linked_personal_os: boolean;
  thread_count: number;
  last_activity: string | null;
  created_at: string | null;
}

export interface UsersResponse {
  users: UserStats[];
  total: number;
}

export interface AdminStats {
  total_users: number;
  active_users_7d: number;
  linked_personal_os: number;
  total_threads: number;
  messages_today: number;
  messages_7d: number;
}

export const useAdminService = () => {
  const authApiClient = useAuthApi();

  const fetchUsers = async (limit = 50, offset = 0): Promise<UsersResponse> => {
    const { data } = await authApiClient.get<UsersResponse>("/admin/users", {
      params: { limit, offset },
    });
    return data;
  };

  const fetchStats = async (): Promise<AdminStats> => {
    const { data } = await authApiClient.get<AdminStats>("/admin/stats");
    return data;
  };

  return {
    fetchUsers,
    fetchStats,
  };
};
