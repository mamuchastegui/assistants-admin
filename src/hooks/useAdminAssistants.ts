import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useAdminService,
  AssistantConfig,
  AssistantConfigCreate,
  AssistantConfigUpdate,
} from "@/api/adminService";

export const useAdminAssistants = () => {
  const queryClient = useQueryClient();
  const adminService = useAdminService();

  // Query to list all assistants
  const {
    data: assistantsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "assistants"],
    queryFn: () => adminService.fetchAssistants(),
    staleTime: 30000,
  });

  // Create assistant mutation
  const createMutation = useMutation({
    mutationFn: (data: AssistantConfigCreate) => adminService.createAssistant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "assistants"] });
      toast.success("Assistant creado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al crear assistant: ${error.message}`);
    },
  });

  // Update assistant mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssistantConfigUpdate }) =>
      adminService.updateAssistant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "assistants"] });
      toast.success("Assistant actualizado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar assistant: ${error.message}`);
    },
  });

  // Delete assistant mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteAssistant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "assistants"] });
      toast.success("Assistant eliminado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar assistant: ${error.message}`);
    },
  });

  return {
    assistants: assistantsData?.assistants || [],
    total: assistantsData?.total || 0,
    isLoading,
    isError,
    error,
    refetch,
    createAssistant: createMutation.mutate,
    updateAssistant: (id: string, data: AssistantConfigUpdate) =>
      updateMutation.mutate({ id, data }),
    deleteAssistant: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export type { AssistantConfig, AssistantConfigCreate, AssistantConfigUpdate };
