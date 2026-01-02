import { useQuery } from "@tanstack/react-query";
import { useAuthApi } from "@/api/client";

// Types for API responses

interface SystemStats {
  total_users_with_preferences: number;
  users_with_consent: number;
  morning_enabled_count: number;
  evening_enabled_count: number;
  users_with_phones: number;
}

interface StatusCounts {
  sent?: number;
  pending?: number;
  failed?: number;
  delivered?: number;
  enqueued?: number;
  retrying?: number;
  [key: string]: number | undefined;
}

interface SlotCounts {
  morning?: number;
  evening?: number;
}

interface LastNudge {
  id: string;
  user_id: string;
  slot: "morning" | "evening";
  status: string;
  created_at: string;
}

interface RecentActivity {
  total_nudges: number;
  by_status: StatusCounts;
  by_slot: SlotCounts;
  last_nudge: LastNudge | null;
}

// System status response (no user_id)
interface NudgeSystemStatusResponse {
  status: string;
  data: {
    tenant_id: string;
    system_stats: SystemStats;
    recent_activity: RecentActivity;
    analysis_timestamp: string;
  };
}

// User preferences
interface UserPreferences {
  morning_enabled: boolean;
  evening_enabled: boolean;
  timezone: string;
  morning_time: string | null;
  evening_time: string | null;
  quiet_start: string | null;
  quiet_end: string | null;
  consent: boolean;
  created_at: string | null;
  updated_at: string | null;
}

interface UserInfo {
  phone_number: string | null;
  has_phone: boolean;
}

interface TimeAnalysis {
  timezone: string;
  utc_time: string;
  local_time: string;
  local_hour: number;
  local_minute: number;
  is_valid_tz: boolean;
}

interface EligibilityCheck {
  status: "PASS" | "FAIL" | "INFO";
  value?: boolean | string | number | null;
  note?: string;
  [key: string]: unknown;
}

interface SlotEligibility {
  eligible: boolean;
  failed_checks: string[];
  checks: Record<string, EligibilityCheck>;
  note?: string;
}

interface Eligibility {
  morning: SlotEligibility;
  evening: SlotEligibility;
}

// User status response (with user_id)
interface NudgeUserStatusResponse {
  status: string;
  data: {
    user_id: string;
    tenant_id: string;
    preferences: UserPreferences;
    user_info: UserInfo;
    time_analysis: TimeAnalysis;
    eligibility: Eligibility;
    recent_activity: RecentActivity;
    analysis_timestamp: string;
  };
}

// Delivery status types
interface NudgeRecord {
  id: string;
  user_id: string;
  slot: "morning" | "evening";
  local_date: string | null;
  status: string;
  created_at: string | null;
  updated_at?: string | null;
  user_phone_number?: string | null;
  provider_phone_id?: string | null;
  template_vars?: Record<string, unknown> | null;
  fire_at_utc?: string | null;
  outbox_count?: number;
  delivery_summary?: DeliverySummary;
}

interface OutboxRecord {
  id: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  processed_at: string | null;
  error_message: string | null;
  retry_count: number;
}

interface DeliverySummary {
  status: "delivered" | "failed" | "pending" | "no_outbox" | "unknown";
  message: string;
  processed_at?: string | null;
  error?: string | null;
}

// Delivery status for specific nudge
interface NudgeDeliveryDetailResponse {
  status: string;
  data: {
    nudge: NudgeRecord;
    outbox_records: OutboxRecord[];
    delivery_summary: DeliverySummary;
  };
}

// Delivery status for user
interface NudgeUserDeliveryResponse {
  status: string;
  data: {
    user_id: string;
    tenant_id: string;
    total_nudges: number;
    status_counts: StatusCounts;
    delivery_stats: {
      sent: number;
      pending: number;
      failed: number;
      unknown: number;
    };
    nudges: NudgeRecord[];
    analysis_timestamp: string;
  };
}

// Delivery status for system
interface NudgeSystemDeliveryResponse {
  status: string;
  data: {
    tenant_id: string;
    system_delivery_stats: {
      total_nudges_sent: number;
      total_outbox_records: number;
      nudge_status_counts: StatusCounts;
      outbox_status_counts: StatusCounts;
      slot_counts: SlotCounts;
    };
    analysis_period: {
      since_date: string;
      days: number;
    };
    analysis_timestamp: string;
  };
}

// Hook params
interface DeliveryStatusParams {
  user_id?: string;
  nudge_id?: string;
  days?: number;
}

// Hooks

export function useNudgeSystemStatus(days: number = 7) {
  const authApi = useAuthApi();

  return useQuery<NudgeSystemStatusResponse>({
    queryKey: ["nudges", "system-status", days],
    queryFn: async () => {
      const response = await authApi.get(`/internal/nudges/cron/status?days=${days}`);
      return response.data;
    },
    staleTime: 30000, // 30 seconds
  });
}

export function useNudgeUserStatus(userId: string | null, days: number = 7) {
  const authApi = useAuthApi();

  return useQuery<NudgeUserStatusResponse>({
    queryKey: ["nudges", "user-status", userId, days],
    queryFn: async () => {
      const response = await authApi.get(`/internal/nudges/cron/status?user_id=${userId}&days=${days}`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 30000,
  });
}

export function useNudgeDeliveryStatus(params: DeliveryStatusParams = {}) {
  const authApi = useAuthApi();
  const { user_id, nudge_id, days = 7 } = params;

  return useQuery<NudgeSystemDeliveryResponse | NudgeUserDeliveryResponse | NudgeDeliveryDetailResponse>({
    queryKey: ["nudges", "delivery-status", user_id, nudge_id, days],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (user_id) queryParams.append("user_id", user_id);
      if (nudge_id) queryParams.append("nudge_id", nudge_id);
      queryParams.append("days", days.toString());

      const response = await authApi.get(`/internal/nudges/cron/delivery-status?${queryParams.toString()}`);
      return response.data;
    },
    staleTime: 30000,
  });
}

export function useNudgeDebug(userId: string | null, slot: "morning" | "evening" = "morning") {
  const authApi = useAuthApi();

  return useQuery<NudgeUserStatusResponse>({
    queryKey: ["nudges", "debug", userId, slot],
    queryFn: async () => {
      const response = await authApi.get(`/internal/nudges/cron/debug/${userId}?slot=${slot}`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 30000,
  });
}

// Export types for use in components
export type {
  NudgeSystemStatusResponse,
  NudgeUserStatusResponse,
  NudgeSystemDeliveryResponse,
  NudgeUserDeliveryResponse,
  NudgeDeliveryDetailResponse,
  NudgeRecord,
  SystemStats,
  RecentActivity,
  StatusCounts,
  SlotCounts,
  UserPreferences,
  Eligibility,
  SlotEligibility,
  EligibilityCheck,
  DeliverySummary,
};
