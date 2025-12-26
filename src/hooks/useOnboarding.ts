import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

const ONBOARDING_COMPLETED_KEY = 'condamind_onboarding_completed';

export interface OnboardingState {
  isCompleted: boolean;
  completedAt: string | null;
}

export const useOnboarding = () => {
  const { user, isAuthenticated } = useAuth();
  const [isCompleted, setIsCompleted] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);

  const getStorageKey = useCallback(() => {
    const userId = user?.sub || 'anonymous';
    return `${ONBOARDING_COMPLETED_KEY}_${userId}`;
  }, [user?.sub]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    const storageKey = getStorageKey();
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const state: OnboardingState = JSON.parse(stored);
        setIsCompleted(state.isCompleted);
      } catch {
        setIsCompleted(false);
      }
    } else {
      setIsCompleted(false);
    }

    setIsLoading(false);
  }, [isAuthenticated, user, getStorageKey]);

  const completeOnboarding = useCallback(() => {
    const storageKey = getStorageKey();
    const state: OnboardingState = {
      isCompleted: true,
      completedAt: new Date().toISOString()
    };
    localStorage.setItem(storageKey, JSON.stringify(state));
    setIsCompleted(true);
  }, [getStorageKey]);

  const resetOnboarding = useCallback(() => {
    const storageKey = getStorageKey();
    localStorage.removeItem(storageKey);
    setIsCompleted(false);
  }, [getStorageKey]);

  return {
    isCompleted,
    isLoading,
    completeOnboarding,
    resetOnboarding,
    shouldShowOnboarding: !isLoading && isAuthenticated && !isCompleted
  };
};
