
import { useEffect } from 'react';

interface UseDocumentTitleProps {
  count: number;
  baseTitle?: string;
  countPrefix?: string;
}

export const useDocumentTitle = ({ 
  count, 
  baseTitle = 'CONDAMIND Assistants',
  countPrefix = 'Solicitudes Pendientes | ' 
}: UseDocumentTitleProps) => {
  // Update document title based on count
  useEffect(() => {
    if (count > 0) {
      document.title = `(${count}) ${countPrefix}${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
    
    return () => {
      document.title = baseTitle;
    };
  }, [count, baseTitle, countPrefix]);
};
