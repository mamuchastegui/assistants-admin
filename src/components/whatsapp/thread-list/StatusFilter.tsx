
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface StatusFilterProps {
  statusFilter: string | null;
  onFilterChange: (status: string | null) => void;
}

const STATUS_OPTIONS = [
  { value: "human_needed", label: "Requiere atención", color: "bg-red-600" },
  { value: "human_answering", label: "Respondiendo", color: "bg-amber-500" },
  { value: "error", label: "Error", color: "bg-red-800" },
  { value: "bot_handling", label: "Bot atendiendo", color: "bg-blue-600" },
  { value: "waiting_user", label: "Esperando al usuario", color: "bg-green-600" },
  { value: "new", label: "Nuevo", color: "bg-purple-600" },
  { value: "resolved", label: "Resuelto", color: "bg-green-800" },
  { value: "archived", label: "Archivado", color: "bg-gray-600" },
  { value: "expired", label: "Expirado", color: "bg-gray-800" }
];

export const getStatusColor = (status: string): string => {
  const statusOption = STATUS_OPTIONS.find(option => option.value === status);
  return statusOption?.color || "bg-gray-500";
};

const StatusFilter: React.FC<StatusFilterProps> = ({ statusFilter, onFilterChange }) => {
  return (
    <div className="w-full">
      <Select 
        value={statusFilter || "all"} 
        onValueChange={(value) => onFilterChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-full bg-muted/40 text-xs h-9">
          <SelectValue placeholder="Filtrar por estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${option.color}`}></div>
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StatusFilter;
