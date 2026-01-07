import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useAdminService,
  Tenant,
  TenantCreate,
  TenantUpdate,
} from "@/api/adminService";

export const useAdminTenants = () => {
  const queryClient = useQueryClient();
  const adminService = useAdminService();

  // Query to list all tenants
  const {
    data: tenantsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "tenants"],
    queryFn: () => adminService.fetchTenants(),
    staleTime: 30000,
  });

  // Create tenant mutation
  const createMutation = useMutation({
    mutationFn: (data: TenantCreate) => adminService.createTenant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
      toast.success("Tenant creado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al crear tenant: ${error.message}`);
    },
  });

  // Update tenant mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TenantUpdate }) =>
      adminService.updateTenant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
      toast.success("Tenant actualizado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar tenant: ${error.message}`);
    },
  });

  // Delete tenant mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
      toast.success("Tenant eliminado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar tenant: ${error.message}`);
    },
  });

  return {
    tenants: tenantsData?.tenants || [],
    total: tenantsData?.total || 0,
    isLoading,
    isError,
    error,
    refetch,
    createTenant: createMutation.mutate,
    updateTenant: (id: string, data: TenantUpdate) =>
      updateMutation.mutate({ id, data }),
    deleteTenant: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export type { Tenant, TenantCreate, TenantUpdate };
