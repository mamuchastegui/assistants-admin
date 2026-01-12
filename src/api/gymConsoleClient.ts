/**
 * API client for communicating with personal-os-console (gym.condamind.com)
 * Uses internal API key authentication for service-to-service calls
 */
import axios, { AxiosInstance } from 'axios';

// Types matching personal-os-console schema
export interface GymPlanUser {
  id: string;
  name: string | null;
  email: string;
}

export interface GymWorkoutPlan {
  id: string;
  user: GymPlanUser;
  plan: GymPlanContent;
  status: 'active' | 'completed' | 'archived';
  aiModel: string | null;
  createdAt: string | null;
  startDate: string | null;
  endDate: string | null;
  // These are null in personal-os-console (no trainer concept there)
  trainer: null;
  assignedClient: null;
  assignedAt: null;
  generationPrompt: null;
  archivedAt: null;
}

export interface GymPlanContent {
  programName?: string;
  weeklyPlan?: Record<string, GymWorkoutDay>;
  tips?: string[];
  request?: {
    level?: string;
    daysPerWeek?: number;
    splitType?: string;
    source?: 'ai' | 'template';
    model?: string;
  };
}

export interface GymWorkoutDay {
  dayName: string;
  muscleGroups: string[];
  warmup?: string[];
  exercises: GymExercise[];
  estimatedDuration?: number;
  notes?: string;
}

export interface GymExercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds?: number;
  notes?: string;
}

export interface GymPlansListResponse {
  plans: GymWorkoutPlan[];
  total: number;
}

export interface GymPlanUpdate {
  plan?: Partial<GymPlanContent>;
  status?: 'active' | 'completed' | 'archived';
}

class GymConsoleClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = import.meta.env.VITE_GYM_CONSOLE_URL || 'https://gym.condamind.com';
    const apiKey = import.meta.env.VITE_GYM_INTERNAL_API_KEY || '';

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'x-internal-api-key': apiKey,
      },
    });
  }

  /**
   * Get gym plans for a list of user emails
   */
  async getPlans(params: {
    emails: string[];
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<GymPlansListResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('emails', params.emails.join(','));
    if (params.status) queryParams.append('status', params.status);
    if (params.limit) queryParams.append('limit', String(params.limit));
    if (params.offset) queryParams.append('offset', String(params.offset));

    const response = await this.client.get(`/api/internal/gym/plans?${queryParams}`);
    return response.data;
  }

  /**
   * Get a single gym plan by ID
   */
  async getPlan(planId: string): Promise<GymWorkoutPlan> {
    const response = await this.client.get(`/api/internal/gym/plans/${planId}`);
    return response.data;
  }

  /**
   * Update a gym plan
   */
  async updatePlan(planId: string, updates: GymPlanUpdate): Promise<GymWorkoutPlan> {
    const response = await this.client.put(`/api/internal/gym/plans/${planId}`, updates);
    return response.data;
  }
}

// Singleton instance
export const gymConsoleClient = new GymConsoleClient();
