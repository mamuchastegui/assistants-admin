import { useQuery } from "@tanstack/react-query";
import { useAdminService, TenantUser } from "@/api/adminService";

export const useTenantUsers = (tenantId: string | null) => {
  const adminService = useAdminService();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "tenants", tenantId, "users"],
    queryFn: () => adminService.fetchTenantUsers(tenantId!),
    enabled: !!tenantId,
    staleTime: 30000,
  });

  return {
    users: data?.users || [],
    total: data?.total || 0,
    isLoading,
    isError,
    error,
    refetch,
  };
};
