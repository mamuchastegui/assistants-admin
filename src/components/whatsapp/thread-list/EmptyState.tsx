
import React from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { MessageSquare, RefreshCw, Loader2, Inbox } from "lucide-react";

interface EmptyStateProps {
  type: "loading" | "error" | "empty" | "no-results" | "no-conversations";
  onRefresh?: () => void;
  errorMessage?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onRefresh, errorMessage }) => {
  switch (type) {
    case "loading":
      return (
        <CardContent className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-8 sm:w-10 h-8 sm:h-10 animate-spin text-primary" />
          <p className="mt-4 text-xs sm:text-sm text-muted-foreground">Cargando conversaciones...</p>
        </CardContent>
      );

    case "error":
      return (
        <CardContent className="flex flex-col items-center justify-center h-64">
          <MessageSquare className="w-8 sm:w-10 h-8 sm:h-10 text-muted-foreground" />
          <p className="mt-4 text-xs sm:text-sm text-muted-foreground">
            {errorMessage || "Error al cargar las conversaciones"}
          </p>
          {onRefresh && (
            <Button variant="outline" className="mt-4" onClick={onRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          )}
        </CardContent>
      );

    case "empty":
      return (
        <CardContent className="flex flex-col items-center justify-center h-64">
          <MessageSquare className="w-8 sm:w-10 h-8 sm:h-10 text-muted-foreground" />
          <p className="mt-4 text-xs sm:text-sm text-muted-foreground">No hay conversaciones</p>
          {onRefresh && (
            <Button variant="outline" className="mt-4" onClick={onRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          )}
        </CardContent>
      );
      
    case "no-conversations":
      return (
        <CardContent className="flex flex-col items-center justify-center h-64">
          <Inbox className="w-8 sm:w-10 h-8 sm:h-10 text-muted-foreground" />
          <p className="mt-4 text-xs sm:text-sm text-muted-foreground">Todavía no hay conversaciones</p>
          {onRefresh && (
            <Button variant="outline" className="mt-4" onClick={onRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          )}
        </CardContent>
      );
      
    case "no-results":
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground text-xs sm:text-sm">No se encontraron contactos</p>
        </div>
      );
      
    default:
      return null;
  }
};

export default EmptyState;
