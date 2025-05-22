import React, { createContext, useContext } from "react";
import { useHumanNeededCounter } from "@/hooks/useHumanNeededCounter";

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
  // Utilizamos el hook una sola vez a nivel de provider
  const value = useHumanNeededCounter({});
  
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext); 