import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAdminService, AdminStats, UsersResponse } from "@/api/adminService";

export const useAdminStats = () => {
  const { fetchStats, fetchUsers } = useAdminService();

  const statsQuery = useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      try {
        return await fetchStats();
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        toast.error("Error al cargar estadisticas");
        throw error;
      }
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const usersQuery = useQuery<UsersResponse>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      try {
        return await fetchUsers();
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Error al cargar usuarios");
        throw error;
      }
    },
    refetchInterval: 60000, // Refresh every minute
  });

  return {
    stats: statsQuery.data,
    users: usersQuery.data?.users ?? [],
    totalUsers: usersQuery.data?.total ?? 0,
    isLoadingStats: statsQuery.isLoading,
    isLoadingUsers: usersQuery.isLoading,
    isError: statsQuery.isError || usersQuery.isError,
    refetch: () => {
      statsQuery.refetch();
      usersQuery.refetch();
    },
  };
};
