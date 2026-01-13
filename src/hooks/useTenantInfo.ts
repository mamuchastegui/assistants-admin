import { useQuery } from '@tanstack/react-query';
import { useAuthApi } from '@/api/client';
import { useTenant } from '@/context/TenantContext';
import { Tenant } from '@/api/adminService';

export interface TenantPhones {
  tenant_id: string;
  entity_phone_ids: string[];
  primary_phone_id: string | null;
}

export interface TenantInfo extends Tenant {
  phones?: TenantPhones;
}

export const useTenantInfo = () => {
  const authApi = useAuthApi();
  const { orgId } = useTenant();

  return useQuery({
    queryKey: ['tenantInfo', orgId],
    queryFn: async () => {
      if (!orgId) return null;

      // Use the /me endpoint which doesn't require admin
      const { data: tenant } = await authApi.get<TenantInfo | null>('/admin/tenants/me');

      if (!tenant) return null;

      // Fetch phone IDs for this tenant (optional, may fail for non-admins)
      try {
        const { data: phones } = await authApi.get<TenantPhones>(`/admin/tenants/${tenant.id}/phones`);
        return { ...tenant, phones };
      } catch (error) {
        // If phone fetch fails, return tenant without phones
        return tenant;
      }
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Hook to fetch just the phone IDs for a tenant
export const useTenantPhones = (tenantId: string | undefined) => {
  const authApi = useAuthApi();

  return useQuery({
    queryKey: ['tenant-phones', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const { data } = await authApi.get<TenantPhones>(`/admin/tenants/${tenantId}/phones`);
      return data;
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });
};
