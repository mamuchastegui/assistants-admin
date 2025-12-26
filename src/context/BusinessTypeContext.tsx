import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export type BusinessType = 'gym' | 'hotel' | 'habits' | null;

export interface BusinessConfig {
  name: string;
  description: string;
  icon: string;
}

const businessConfigs: Record<Exclude<BusinessType, null>, BusinessConfig> = {
  gym: {
    name: 'Gimnasio',
    description: 'Gestiona miembros, clases y pagos',
    icon: 'Dumbbell'
  },
  hotel: {
    name: 'Hoteleria',
    description: 'Gestiona reservas y habitaciones',
    icon: 'Hotel'
  },
  habits: {
    name: 'Habitos',
    description: 'Ayuda a tus usuarios a crear habitos',
    icon: 'Target'
  }
};

interface BusinessTypeContextType {
  businessType: BusinessType;
  setBusinessType: (type: BusinessType) => void;
  businessConfig: BusinessConfig | null;
  isLoading: boolean;
}

const BusinessTypeContext = createContext<BusinessTypeContextType>({
  businessType: null,
  setBusinessType: () => {},
  businessConfig: null,
  isLoading: true
});

const BUSINESS_TYPE_KEY = 'condamind_business_type';

export const BusinessTypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [businessType, setBusinessTypeState] = useState<BusinessType>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getStorageKey = useCallback(() => {
    const userId = user?.sub || 'anonymous';
    return `${BUSINESS_TYPE_KEY}_${userId}`;
  }, [user?.sub]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    const storageKey = getStorageKey();
    const stored = localStorage.getItem(storageKey);

    if (stored && ['gym', 'hotel', 'habits'].includes(stored)) {
      setBusinessTypeState(stored as BusinessType);
    }

    setIsLoading(false);
  }, [isAuthenticated, user, getStorageKey]);

  const setBusinessType = useCallback((type: BusinessType) => {
    const storageKey = getStorageKey();
    if (type) {
      localStorage.setItem(storageKey, type);
    } else {
      localStorage.removeItem(storageKey);
    }
    setBusinessTypeState(type);
  }, [getStorageKey]);

  const businessConfig = businessType ? businessConfigs[businessType] : null;

  return (
    <BusinessTypeContext.Provider value={{ businessType, setBusinessType, businessConfig, isLoading }}>
      {children}
    </BusinessTypeContext.Provider>
  );
};

export const useBusinessType = () => useContext(BusinessTypeContext);

export { businessConfigs };
