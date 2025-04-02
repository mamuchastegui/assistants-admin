
import React from "react";
import { format } from "date-fns";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AppointmentFormData {
  client: string;
  service: string;
  time: string;
  duration: string;
  notes?: string;
}

interface AppointmentFormProps {
  title: string;
  description: string;
  formData: AppointmentFormData;
  selectedDate: Date;
  isLoading: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (value: string, field: string) => void;
  onSubmit: () => void;
  idPrefix?: string;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  title,
  description,
  formData,
  selectedDate,
  isLoading,
  onFormChange,
  onSelectChange,
  onSubmit,
  idPrefix = "",
}) => {
  const prefix = idPrefix ? `${idPrefix}-` : "";
  
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          {description}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`${prefix}date`} className="text-right">
            Fecha
          </Label>
          <Input
            id={`${prefix}date`}
            value={format(selectedDate, "dd/MM/yyyy")}
            className="col-span-3"
            readOnly
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`${prefix}time`} className="text-right">
            Hora
          </Label>
          <Input
            id={`${prefix}time`}
            type="time"
            value={formData.time}
            onChange={onFormChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`${prefix}client`} className="text-right">
            Cliente
          </Label>
          <Input
            id={`${prefix}client`}
            placeholder="Nombre del cliente"
            value={formData.client}
            onChange={onFormChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`${prefix}service`} className="text-right">
            Servicio
          </Label>
          <Select 
            value={formData.service} 
            onValueChange={(value) => onSelectChange(value, 'service')}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Seleccionar servicio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Corte de pelo">Corte de pelo</SelectItem>
              <SelectItem value="Tinte">Tinte</SelectItem>
              <SelectItem value="Manicura">Manicura</SelectItem>
              <SelectItem value="Afeitado">Afeitado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`${prefix}duration`} className="text-right">
            Duración
          </Label>
          <Select 
            value={formData.duration} 
            onValueChange={(value) => onSelectChange(value, 'duration')}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Seleccionar duración" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutos</SelectItem>
              <SelectItem value="30">30 minutos</SelectItem>
              <SelectItem value="45">45 minutos</SelectItem>
              <SelectItem value="60">1 hora</SelectItem>
              <SelectItem value="90">1 hora 30 minutos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`${prefix}notes`} className="text-right">
            Notas
          </Label>
          <Input
            id={`${prefix}notes`}
            placeholder="Notas adicionales"
            value={formData.notes}
            onChange={onFormChange}
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <Button 
          type="submit" 
          onClick={onSubmit}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {title === "Nuevo Turno" ? "Guardar" : "Guardar Cambios"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AppointmentForm;
