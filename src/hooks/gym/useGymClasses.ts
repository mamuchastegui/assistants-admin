import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthApi } from '@/api/client';

// Types
export interface GymClass {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  max_capacity: number;
  instructor?: string;
  trainer_id?: string;
  trainer_name?: string;
  category?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  class_type: 'group' | 'individual';
  requirements?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateClassInput {
  name: string;
  description?: string;
  duration_minutes?: number;
  max_capacity?: number;
  instructor?: string;
  trainer_id?: string;
  category?: string;
  difficulty_level?: GymClass['difficulty_level'];
  class_type?: GymClass['class_type'];
  requirements?: string;
}

export interface UpdateClassInput extends Partial<CreateClassInput> {
  is_active?: boolean;
}

export interface ListClassesParams {
  category?: string;
  class_type?: 'group' | 'individual';
  include_inactive?: boolean;
}

export interface GymClassListResponse {
  classes: GymClass[];
  total: number;
}

// Query keys
const CLASSES_QUERY_KEY = ['gym', 'classes'];

export const useGymClasses = () => {
  const authApi = useAuthApi();
  const queryClient = useQueryClient();

  // List classes
  const useListClasses = (params?: ListClassesParams) => {
    return useQuery({
      queryKey: [...CLASSES_QUERY_KEY, 'list', params],
      queryFn: async () => {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append('category', params.category);
        if (params?.class_type) queryParams.append('class_type', params.class_type);
        if (params?.include_inactive) queryParams.append('include_inactive', 'true');

        const response = await authApi.get(`/api/gym/classes?${queryParams.toString()}`);
        return response.data as GymClassListResponse;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get single class
  const useGetClass = (classId: string, enabled = true) => {
    return useQuery({
      queryKey: [...CLASSES_QUERY_KEY, classId],
      queryFn: async () => {
        const response = await authApi.get(`/api/gym/classes/${classId}`);
        return response.data as GymClass;
      },
      enabled: enabled && !!classId,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Create class
  const useCreateClass = () => {
    return useMutation({
      mutationFn: async (data: CreateClassInput) => {
        const response = await authApi.post('/api/gym/classes', data);
        return response.data as GymClass;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: CLASSES_QUERY_KEY });
        toast.success(`Clase "${data.name}" creada exitosamente`);
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Error al crear la clase';
        toast.error(message);
      },
    });
  };

  // Update class
  const useUpdateClass = () => {
    return useMutation({
      mutationFn: async ({ classId, data }: { classId: string; data: UpdateClassInput }) => {
        const response = await authApi.put(`/api/gym/classes/${classId}`, data);
        return response.data as GymClass;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [...CLASSES_QUERY_KEY, data.id] });
        queryClient.invalidateQueries({ queryKey: [...CLASSES_QUERY_KEY, 'list'] });
        toast.success(`Clase "${data.name}" actualizada exitosamente`);
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Error al actualizar la clase';
        toast.error(message);
      },
    });
  };

  // Delete class
  const useDeleteClass = () => {
    return useMutation({
      mutationFn: async (classId: string) => {
        const response = await authApi.delete(`/api/gym/classes/${classId}`);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: CLASSES_QUERY_KEY });
        toast.success('Clase desactivada exitosamente');
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Error al desactivar la clase';
        toast.error(message);
      },
    });
  };

  return {
    // Queries
    useListClasses,
    useGetClass,
    // Mutations
    useCreateClass,
    useUpdateClass,
    useDeleteClass,
  };
};
