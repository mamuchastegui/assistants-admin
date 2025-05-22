
import { useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNotificationSound } from './useNotificationSound';

/**
 * Hook for handling human needed counter events
 */
export const useHumanNeededEvents = () => {
  const { toast } = useToast();
  const { playNotificationSound } = useNotificationSound();
  const lastCount = useRef(0);
  
  const handleMessage = useCallback(
    (eventType: string, data: string) => {
      if (eventType === "initial" || eventType === "update") {
        try {
          const newCount = parseInt(data, 10);
          
          // Make sure newCount is valid before updating state
          if (!isNaN(newCount)) {
            if (newCount > lastCount.current) {
              playNotificationSound();
              toast({
                title: "Nuevas solicitudes pendientes",
                description: `Hay ${newCount} que requieren atención humana.`,
              });
            }
            
            lastCount.current = newCount;
            return newCount;
          } else {
            console.error("Recibido valor inválido para count:", data);
            return null;
          }
        } catch (err) {
          console.error("Error parsing count data:", err, "Data received:", data);
          return null;
        }
      }
      return null;
    },
    [playNotificationSound, toast]
  );
  
  return { handleMessage, lastCount };
};
