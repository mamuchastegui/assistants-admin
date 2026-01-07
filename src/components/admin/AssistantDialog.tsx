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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AssistantConfig,
  AssistantConfigCreate,
  AssistantConfigUpdate,
  Tenant,
} from "@/api/adminService";

interface AssistantDialogProps {
  open: boolean;
  onClose: () => void;
  assistant?: AssistantConfig | null;
  tenants: Tenant[];
  onSave: (data: AssistantConfigCreate | AssistantConfigUpdate) => void;
  isLoading?: boolean;
}

export const AssistantDialog: React.FC<AssistantDialogProps> = ({
  open,
  onClose,
  assistant,
  tenants,
  onSave,
  isLoading,
}) => {
  const isEditing = !!assistant;

  const [formData, setFormData] = useState({
    assistant_id: "",
    tenant_id: "",
    name: "",
    last_name: "",
    type: "",
    profile_picture: "",
    welcome_message: "",
    instructions: "",
    model: "gpt-4o",
    alias: "",
  });

  useEffect(() => {
    if (assistant) {
      setFormData({
        assistant_id: assistant.assistant_id || "",
        tenant_id: assistant.tenant_id || "",
        name: assistant.name || "",
        last_name: assistant.last_name || "",
        type: assistant.type || "",
        profile_picture: assistant.profile_picture || "",
        welcome_message: assistant.welcome_message || "",
        instructions: "",
        model: assistant.model || "gpt-4o",
        alias: assistant.alias || "",
      });
    } else {
      setFormData({
        assistant_id: "",
        tenant_id: "",
        name: "",
        last_name: "",
        type: "",
        profile_picture: "",
        welcome_message: "",
        instructions: "",
        model: "gpt-4o",
        alias: "",
      });
    }
  }, [assistant, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      const updateData: AssistantConfigUpdate = {};
      if (formData.name) updateData.name = formData.name;
      if (formData.last_name) updateData.last_name = formData.last_name;
      if (formData.type) updateData.type = formData.type;
      if (formData.profile_picture) updateData.profile_picture = formData.profile_picture;
      if (formData.welcome_message) updateData.welcome_message = formData.welcome_message;
      if (formData.instructions) updateData.instructions = formData.instructions;
      if (formData.model) updateData.model = formData.model;
      if (formData.alias) updateData.alias = formData.alias;
      if (formData.tenant_id) updateData.tenant_id = formData.tenant_id;
      onSave(updateData);
    } else {
      const createData: AssistantConfigCreate = {
        assistant_id: formData.assistant_id,
        tenant_id: formData.tenant_id,
        name: formData.name,
        last_name: formData.last_name || undefined,
        type: formData.type || undefined,
        profile_picture: formData.profile_picture || undefined,
        welcome_message: formData.welcome_message || undefined,
        instructions: formData.instructions || undefined,
        model: formData.model || undefined,
        alias: formData.alias || undefined,
      };
      onSave(createData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Assistant" : "Nuevo Assistant"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica la configuracion del assistant."
              : "Completa los datos para crear un nuevo assistant config."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <div>
              <Label htmlFor="assistant_id">Assistant ID (OpenAI)</Label>
              <Input
                id="assistant_id"
                value={formData.assistant_id}
                onChange={(e) => setFormData({ ...formData, assistant_id: e.target.value })}
                placeholder="asst_xxx"
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="tenant_id">Tenant</Label>
            <Select
              value={formData.tenant_id}
              onValueChange={(value) => setFormData({ ...formData, tenant_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tenant" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del assistant"
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Apellido</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Apellido"
              />
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de assistant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="model">Modelo</Label>
              <Select
                value={formData.model}
                onValueChange={(value) => setFormData({ ...formData, model: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="alias">Alias (URL friendly)</Label>
            <Input
              id="alias"
              value={formData.alias}
              onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
              placeholder="mi-assistant"
            />
          </div>

          <div>
            <Label htmlFor="profile_picture">URL Foto de Perfil</Label>
            <Input
              id="profile_picture"
              value={formData.profile_picture}
              onChange={(e) => setFormData({ ...formData, profile_picture: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="welcome_message">Mensaje de Bienvenida</Label>
            <Textarea
              id="welcome_message"
              value={formData.welcome_message}
              onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
              placeholder="Mensaje inicial del assistant"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="instructions">
              Instructions {isEditing && "(dejar vacío para no cambiar)"}
            </Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="System prompt del assistant"
              rows={4}
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

export default AssistantDialog;
