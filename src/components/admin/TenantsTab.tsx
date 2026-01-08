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
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash, Plus, ChevronDown, ChevronRight, Users } from "lucide-react";
import { useAdminTenants, Tenant, TenantCreate, TenantUpdate } from "@/hooks/useAdminTenants";
import { TenantDialog } from "./TenantDialog";
import { TenantUsersRow } from "./TenantUsersRow";

const TenantsTab: React.FC = () => {
  const {
    tenants,
    isLoading,
    createTenant,
    updateTenant,
    deleteTenant,
    isCreating,
    isUpdating,
    isDeleting,
  } = useAdminTenants();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedTenants, setExpandedTenants] = useState<Set<string>>(new Set());

  const toggleExpand = (tenantId: string) => {
    setExpandedTenants((prev) => {
      const next = new Set(prev);
      if (next.has(tenantId)) {
        next.delete(tenantId);
      } else {
        next.add(tenantId);
      }
      return next;
    });
  };

  const handleAdd = () => {
    setSelectedTenant(null);
    setDialogOpen(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDialogOpen(true);
  };

  const handleSave = (data: TenantCreate | TenantUpdate) => {
    if (selectedTenant) {
      updateTenant(selectedTenant.id, data as TenantUpdate);
    } else {
      createTenant(data as TenantCreate);
    }
    setDialogOpen(false);
    setSelectedTenant(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteTenant(deleteId);
      setDeleteId(null);
    }
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
          <h3 className="text-lg font-semibold">Tenants</h3>
          <p className="text-sm text-muted-foreground">
            Gestiona los tenants del sistema
          </p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Nuevo Tenant</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Org ID</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>Assistant ID</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : tenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay tenants configurados
                  </TableCell>
                </TableRow>
              ) : (
                tenants.map((tenant) => (
                  <React.Fragment key={tenant.id}>
                    <TableRow>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell className="text-sm">
                        {tenant.owner_email || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {tenant.org_id}
                        </code>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {tenant.client_id}
                        </code>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {tenant.assistant_id}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(tenant.id)}
                          className="gap-1"
                        >
                          {expandedTenants.has(tenant.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <Users className="h-4 w-4" />
                          <span>{tenant.user_count}</span>
                        </Button>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(tenant.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(tenant)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(tenant.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedTenants.has(tenant.id) && (
                      <TenantUsersRow tenantId={tenant.id} colSpan={8} />
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TenantDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedTenant(null);
        }}
        tenant={selectedTenant}
        onSave={handleSave}
        isLoading={isCreating || isUpdating}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tenant?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. El tenant sera marcado como eliminado.
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

export default TenantsTab;
