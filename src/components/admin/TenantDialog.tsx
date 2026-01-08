import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tenant, TenantCreate, TenantUpdate } from "@/api/adminService";

interface TenantDialogProps {
  open: boolean;
  onClose: () => void;
  tenant?: Tenant | null;
  onSave: (data: TenantCreate | TenantUpdate) => void;
  isLoading?: boolean;
}

export const TenantDialog: React.FC<TenantDialogProps> = ({
  open,
  onClose,
  tenant,
  onSave,
  isLoading,
}) => {
  const isEditing = !!tenant;

  const [formData, setFormData] = useState({
    org_id: "",
    client_id: "",
    secret_id: "",
    name: "",
    owner_email: "",
    openai_api_key: "",
    assistant_id: "",
    welcome_message: "",
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        org_id: tenant.org_id || "",
        client_id: tenant.client_id || "",
        secret_id: "",
        name: tenant.name || "",
        owner_email: tenant.owner_email || "",
        openai_api_key: "",
        assistant_id: tenant.assistant_id || "",
        welcome_message: tenant.welcome_message || "",
      });
    } else {
      setFormData({
        org_id: "",
        client_id: "",
        secret_id: "",
        name: "",
        owner_email: "",
        openai_api_key: "",
        assistant_id: "",
        welcome_message: "",
      });
    }
  }, [tenant, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      const updateData: TenantUpdate = {};
      if (formData.name) updateData.name = formData.name;
      if (formData.owner_email) updateData.owner_email = formData.owner_email;
      if (formData.openai_api_key) updateData.openai_api_key = formData.openai_api_key;
      if (formData.assistant_id) updateData.assistant_id = formData.assistant_id;
      if (formData.welcome_message !== undefined) updateData.welcome_message = formData.welcome_message;
      if (formData.org_id) updateData.org_id = formData.org_id;
      if (formData.client_id) updateData.client_id = formData.client_id;
      if (formData.secret_id) updateData.secret_id = formData.secret_id;
      onSave(updateData);
    } else {
      const createData: TenantCreate = {
        org_id: formData.org_id,
        client_id: formData.client_id,
        secret_id: formData.secret_id,
        name: formData.name,
        owner_email: formData.owner_email || undefined,
        openai_api_key: formData.openai_api_key,
        assistant_id: formData.assistant_id,
        welcome_message: formData.welcome_message || undefined,
      };
      onSave(createData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Tenant" : "Nuevo Tenant"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del tenant. Los campos sensibles solo se actualizan si se llenan."
              : "Completa los datos para crear un nuevo tenant."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nombre del tenant"
              required={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="owner_email">Owner Email</Label>
            <Input
              id="owner_email"
              type="email"
              value={formData.owner_email}
              onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
              placeholder="owner@ejemplo.com"
            />
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div>
              <Label htmlFor="org_id">Org ID</Label>
              <Input
                id="org_id"
                value={formData.org_id}
                onChange={(e) => setFormData({ ...formData, org_id: e.target.value })}
                placeholder="org_xxx"
                required={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="client_id">Client ID</Label>
              <Input
                id="client_id"
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                placeholder="client_xxx"
                required={!isEditing}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="secret_id">
              Secret ID {isEditing && "(dejar vacío para no cambiar)"}
            </Label>
            <Input
              id="secret_id"
              type="password"
              value={formData.secret_id}
              onChange={(e) => setFormData({ ...formData, secret_id: e.target.value })}
              placeholder={isEditing ? "••••••••" : "secret_xxx"}
              required={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="openai_api_key">
              OpenAI API Key {isEditing && "(dejar vacío para no cambiar)"}
            </Label>
            <Input
              id="openai_api_key"
              type="password"
              value={formData.openai_api_key}
              onChange={(e) => setFormData({ ...formData, openai_api_key: e.target.value })}
              placeholder={isEditing ? "••••••••" : "sk-..."}
              required={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="assistant_id">Assistant ID</Label>
            <Input
              id="assistant_id"
              value={formData.assistant_id}
              onChange={(e) => setFormData({ ...formData, assistant_id: e.target.value })}
              placeholder="asst_xxx"
              required={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="welcome_message">Mensaje de Bienvenida</Label>
            <Textarea
              id="welcome_message"
              value={formData.welcome_message}
              onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
              placeholder="Mensaje inicial para nuevos usuarios"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TenantDialog;
