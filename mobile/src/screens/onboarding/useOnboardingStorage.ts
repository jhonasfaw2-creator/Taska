import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@taska/onboarding_completed';

type UseOnboardingStorageResult = {
  hasCompletedOnboarding: boolean | null;
  isLoading: boolean;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
};

/**
 * Persists onboarding completion state so returning users skip the flow.
 * Uses AsyncStorage (bundled with Expo). Fails safe if storage is unavailable.
 */
export const useOnboardingStorage = (): UseOnboardingStorageResult => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (isMounted) {
          setHasCompletedOnboarding(value === 'true');
        }
      } catch (error) {
        console.warn('[Onboarding] Failed to read completion state:', error);
        if (isMounted) {
          setHasCompletedOnboarding(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.warn('[Onboarding] Failed to persist completion state:', error);
    }
  }, []);

  const resetOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.warn('[Onboarding] Failed to reset completion state:', error);
    }
  }, []);

  return { hasCompletedOnboarding, isLoading, completeOnboarding, resetOnboarding };
};
