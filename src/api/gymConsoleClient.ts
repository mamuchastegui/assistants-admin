/**
 * API client for communicating with gym.condamind.com admin API
 * Uses Bearer token authentication for admin endpoints
 */
import axios, { AxiosInstance } from 'axios';

// Types matching gym app schema
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
  archivedAt?: string | null;
  trainerId: string | null;
  assignedAt?: string | null;
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
  warmup?: string[] | WarmupBlock; // Supports legacy string[] and new WarmupBlock
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

// Warmup exercise (for mobility/activation blocks)
export interface WarmupExercise {
  name: string;
  sets?: number;
  reps?: string;
  duration?: number; // seconds
  notes?: string;
}

// Structured warmup block
export interface WarmupBlock {
  cardio?: {
    duration: number; // minutes
    description: string;
  };
  mobility: WarmupExercise[];
  activation: WarmupExercise[];
}

// Exercise type for filtering
export type ExerciseType = 'mobility' | 'activation' | 'strength' | 'power' | 'cardio' | 'core';

export interface GymPlansListResponse {
  trainer: {
    id: string;
    businessName: string | null;
    tenantId?: string;
  };
  plans: GymWorkoutPlan[];
  plansByClient: Array<{
    client: GymPlanUser;
    plans: GymWorkoutPlan[];
  }>;
  total: number;
  clientCount: number;
}

export interface GymPlanUpdate {
  plan?: Partial<GymPlanContent>;
  status?: 'active' | 'completed' | 'archived';
}

// Parameters for AI plan generation
export interface GeneratePlanParams {
  userId: string;
  trainerId?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek?: number;
  sessionDuration?: number;
  splitType?: 'full_body' | 'upper_lower' | 'push_pull_legs' | 'bro_split';
  focusAreas?: string[];
  equipmentAvailable?: string[];
  preferredDays?: string[];
  notes?: string;
}

export interface GymTrainer {
  id: string;
  tenantId: string;
  userId: string | null;
  businessName: string | null;
  specialty: string | null;
  bio: string | null;
  inviteCode: string;
  maxClients: number | null;
  instagramHandle: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: string;
  userEmail: string | null;
  userName: string | null;
  activeClientCount: number;
}

export interface GymTrainerClient {
  linkId: string;
  userId: string;
  email: string;
  name: string | null;
  status: string;
  linkedVia: string | null;
  linkedAt: string;
  endedAt: string | null;
  notesFromTrainer: string | null;
  tags: string[] | null;
  userCreatedAt: string | null;
  phoneNumbers: Array<{
    number: string;
    externalUserId: string | null;
    externalTenantId: string | null;
  }>;
}

export interface GymCatalogExercise {
  id: string;
  name: string;
  category: string | null;
  youtubeUrl: string | null;
  movementPattern: string | null;
  equipment: string | null;
  bodyPart: string | null;
  exerciseType: ExerciseType | null;
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
        'Authorization': `Bearer ${apiKey}`,
        'X-Requested-With': 'XMLHttpRequest', // Required for Vercel CSRF bypass
      },
    });
  }

  /**
   * Get all trainers (optionally filtered by tenantId)
   */
  async getTrainers(tenantId?: string): Promise<{ trainers: GymTrainer[]; total: number }> {
    const params = tenantId ? `?tenantId=${tenantId}` : '';
    const response = await this.client.get(`/api/admin/trainers${params}`);
    return response.data;
  }

  /**
   * Get trainer by tenantId (finds trainer associated with a specific tenant)
   */
  async getTrainerByTenant(tenantId: string): Promise<GymTrainer | null> {
    const response = await this.getTrainers(tenantId);
    return response.trainers[0] || null;
  }

  /**
   * Get clients for a specific trainer
   */
  async getTrainerClients(trainerId: string, status: string = 'active'): Promise<{
    trainer: { id: string; businessName: string | null; tenantId: string };
    clients: GymTrainerClient[];
    total: number;
  }> {
    const response = await this.client.get(`/api/admin/trainers/${trainerId}/clients?status=${status}`);
    return response.data;
  }

  /**
   * Get all plans for a trainer's clients
   */
  async getTrainerClientPlans(trainerId: string, params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<GymPlansListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.offset) queryParams.append('offset', String(params.offset));

    const queryString = queryParams.toString();
    const url = `/api/admin/trainers/${trainerId}/clients/plans${queryString ? `?${queryString}` : ''}`;
    const response = await this.client.get(url);
    return response.data;
  }

  /**
   * Get a single gym plan by ID
   */
  async getPlan(planId: string): Promise<GymWorkoutPlan> {
    const response = await this.client.get(`/api/admin/plans/${planId}`);
    return response.data;
  }

  /**
   * Update a gym plan
   */
  async updatePlan(planId: string, updates: GymPlanUpdate): Promise<GymWorkoutPlan> {
    const response = await this.client.put(`/api/admin/plans/${planId}`, updates);
    return response.data;
  }

  /**
   * Generate a new workout plan using AI
   * The endpoint uses GPT-4o-mini with the GYM_PLANNING_PROMPT
   */
  async generatePlan(params: GeneratePlanParams): Promise<GymWorkoutPlan> {
    const response = await this.client.post('/api/admin/plans/generate', params);
    return response.data;
  }

  /**
   * Delete a workout plan
   */
  async deletePlan(planId: string): Promise<void> {
    await this.client.delete(`/api/admin/plans/${planId}`);
  }

  /**
   * Create or sync a trainer from assistants-api to the gym app
   * This is called when a trainer registered in assistants-api needs to access gym app data
   */
  async createOrSyncTrainer(data: {
    tenantId: string;
    businessName?: string;
    specialty?: string;
    bio?: string;
    inviteCode: string;
    maxClients?: number;
    instagramHandle?: string;
    website?: string;
    userEmail: string;
    userName?: string;
  }): Promise<{ trainer: GymTrainer; created: boolean }> {
    const response = await this.client.post('/api/admin/trainers', data);
    return response.data;
  }

  /**
   * Search exercises from the exercise catalog
   * Uses the smart search endpoint with similarity scoring
   * @param query - Search query (min 2 characters)
   * @param exerciseType - Optional filter by exercise type (mobility, activation, strength, etc.)
   */
  async searchExercises(query: string, exerciseType?: ExerciseType): Promise<GymCatalogExercise[]> {
    if (!query || query.length < 2) return [];
    const params = new URLSearchParams({ q: query });
    if (exerciseType) {
      params.append('type', exerciseType);
    }
    const response = await this.client.get(`/api/gym/exercises/search?${params.toString()}`);
    return response.data.exercises || [];
  }
}

// Singleton instance
export const gymConsoleClient = new GymConsoleClient();
