
import React, { createContext, useContext } from "react";
import { useHumanNeededCounter } from "@/hooks/useHumanNeededCounter";
import { useAssistants } from "@/hooks/useAssistants";

interface NotificationsContextType {
  count: number;
  loading: boolean;
  error: Error | null;
}

const NotificationsContext = createContext<NotificationsContextType>({
  count: 0,
  loading: true,
  error: null
});

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Obtenemos el asistente seleccionado actualmente
  const { selectedAssistantId } = useAssistants();
  
  // Utilizamos el hook con el assistant_id
  const value = useHumanNeededCounter({
    assistantId: selectedAssistantId || undefined
  });
  
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
