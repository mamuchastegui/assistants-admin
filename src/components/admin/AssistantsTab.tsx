import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash, Plus, Bot } from "lucide-react";
import {
  useAdminAssistants,
  AssistantConfig,
  AssistantConfigCreate,
  AssistantConfigUpdate,
} from "@/hooks/useAdminAssistants";
import { useAdminTenants } from "@/hooks/useAdminTenants";
import { AssistantDialog } from "./AssistantDialog";

const AssistantsTab: React.FC = () => {
  const {
    assistants,
    isLoading,
    createAssistant,
    updateAssistant,
    deleteAssistant,
    isCreating,
    isUpdating,
    isDeleting,
  } = useAdminAssistants();

  const { tenants } = useAdminTenants();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<AssistantConfig | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    setSelectedAssistant(null);
    setDialogOpen(true);
  };

  const handleEdit = (assistant: AssistantConfig) => {
    setSelectedAssistant(assistant);
    setDialogOpen(true);
  };

  const handleSave = (data: AssistantConfigCreate | AssistantConfigUpdate) => {
    if (selectedAssistant) {
      updateAssistant(selectedAssistant.assistant_id, data as AssistantConfigUpdate);
    } else {
      createAssistant(data as AssistantConfigCreate);
    }
    setDialogOpen(false);
    setSelectedAssistant(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteAssistant(deleteId);
      setDeleteId(null);
    }
  };

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return "-";
    const tenant = tenants.find((t) => t.id === tenantId);
    return tenant?.name || tenantId;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Assistants</h3>
          <p className="text-sm text-muted-foreground">
            Gestiona las configuraciones de assistants
          </p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Nuevo Assistant</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Assistant ID</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Alias</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : assistants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Bot className="h-8 w-8" />
                      <p>No hay assistants configurados</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                assistants.map((assistant) => (
                  <TableRow key={assistant.assistant_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {assistant.profile_picture ? (
                          <img
                            src={assistant.profile_picture}
                            alt={assistant.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <Bot className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">
                            {assistant.name} {assistant.last_name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {assistant.assistant_id}
                      </code>
                    </TableCell>
                    <TableCell>{getTenantName(assistant.tenant_id)}</TableCell>
                    <TableCell>
                      {assistant.type ? (
                        <Badge variant="outline">{assistant.type}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{assistant.model || "gpt-4o"}</Badge>
                    </TableCell>
                    <TableCell>
                      {assistant.alias ? (
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {assistant.alias}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(assistant)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(assistant.assistant_id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AssistantDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedAssistant(null);
        }}
        assistant={selectedAssistant}
        tenants={tenants}
        onSave={handleSave}
        isLoading={isCreating || isUpdating}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar assistant?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. La configuracion del assistant sera eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AssistantsTab;
