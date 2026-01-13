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

// Tenant types
export interface Tenant {
  id: string;
  org_id: string;
  client_id: string;
  name: string;
  assistant_id: string;
  welcome_message: string | null;
  owner_email: string | null;
  user_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface TenantCreate {
  org_id: string;
  client_id: string;
  secret_id: string;
  name: string;
  openai_api_key: string;
  assistant_id: string;
  welcome_message?: string;
  owner_email?: string;
}

export interface TenantUpdate {
  name?: string;
  openai_api_key?: string;
  assistant_id?: string;
  welcome_message?: string;
  org_id?: string;
  client_id?: string;
  secret_id?: string;
  owner_email?: string;
}

// Self-registration types
export interface SelfRegisterRequest {
  business_name: string;
}

export interface SelfRegisterResponse {
  tenant: Tenant;
  message: string;
  created: boolean;
}

export interface TenantsResponse {
  tenants: Tenant[];
  total: number;
}

export interface TenantUser {
  user_id: string;
  email: string | null;
  phone_number: string | null;
  is_active: boolean;
  created_at: string | null;
}

export interface TenantUsersResponse {
  users: TenantUser[];
  total: number;
}

// Assistant types
export interface AssistantConfig {
  assistant_id: string;
  tenant_id: string | null;
  name: string;
  last_name: string | null;
  type: string | null;
  profile_picture: string | null;
  welcome_message: string | null;
  model: string | null;
  alias: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AssistantConfigCreate {
  assistant_id: string;
  tenant_id: string;
  name: string;
  last_name?: string;
  type?: string;
  profile_picture?: string;
  welcome_message?: string;
  instructions?: string;
  model?: string;
  alias?: string;
}

export interface AssistantConfigUpdate {
  name?: string;
  last_name?: string;
  type?: string;
  profile_picture?: string;
  welcome_message?: string;
  instructions?: string;
  model?: string;
  alias?: string;
  tenant_id?: string;
}

export interface AssistantConfigsResponse {
  assistants: AssistantConfig[];
  total: number;
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

  // Tenant methods
  const fetchTenants = async (): Promise<TenantsResponse> => {
    const { data } = await authApiClient.get<TenantsResponse>("/admin/tenants");
    return data;
  };

  const fetchTenant = async (id: string): Promise<Tenant> => {
    const { data } = await authApiClient.get<Tenant>(`/admin/tenants/${id}`);
    return data;
  };

  const createTenant = async (tenantData: TenantCreate): Promise<Tenant> => {
    const { data } = await authApiClient.post<Tenant>("/admin/tenants", tenantData);
    return data;
  };

  const updateTenant = async (id: string, tenantData: TenantUpdate): Promise<Tenant> => {
    const { data } = await authApiClient.put<Tenant>(`/admin/tenants/${id}`, tenantData);
    return data;
  };

  const deleteTenant = async (id: string): Promise<void> => {
    await authApiClient.delete(`/admin/tenants/${id}`);
  };

  const selfRegisterTenant = async (data: SelfRegisterRequest): Promise<SelfRegisterResponse> => {
    const response = await authApiClient.post<SelfRegisterResponse>('/admin/tenants/self-register', data);
    return response.data;
  };

  const fetchTenantUsers = async (tenantId: string): Promise<TenantUsersResponse> => {
    const { data } = await authApiClient.get<TenantUsersResponse>(`/admin/tenants/${tenantId}/users`);
    return data;
  };

  // Assistant methods
  const fetchAssistants = async (): Promise<AssistantConfigsResponse> => {
    const { data } = await authApiClient.get<AssistantConfigsResponse>("/admin/assistants");
    return data;
  };

  const fetchAssistant = async (id: string): Promise<AssistantConfig> => {
    const { data } = await authApiClient.get<AssistantConfig>(`/admin/assistants/${id}`);
    return data;
  };

  const createAssistant = async (configData: AssistantConfigCreate): Promise<AssistantConfig> => {
    const { data } = await authApiClient.post<AssistantConfig>("/admin/assistants", configData);
    return data;
  };

  const updateAssistant = async (id: string, configData: AssistantConfigUpdate): Promise<AssistantConfig> => {
    const { data } = await authApiClient.put<AssistantConfig>(`/admin/assistants/${id}`, configData);
    return data;
  };

  const deleteAssistant = async (id: string): Promise<void> => {
    await authApiClient.delete(`/admin/assistants/${id}`);
  };

  return {
    fetchUsers,
    fetchStats,
    // Tenants
    fetchTenants,
    fetchTenant,
    createTenant,
    updateTenant,
    deleteTenant,
    selfRegisterTenant,
    fetchTenantUsers,
    // Assistants
    fetchAssistants,
    fetchAssistant,
    createAssistant,
    updateAssistant,
    deleteAssistant,
  };
};
