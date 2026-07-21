import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import SplashScreen from '@/screens/SplashScreen';
import { useOnboardingStorage } from '@/screens/onboarding/useOnboardingStorage';
import {
  hasSession,
  getUserProfile,
  isProfileComplete,
  clearSession,
  ApiError,
} from '@/services';

const MIN_SPLASH_MS = 1800;

/**
 * Splash route (app entry). Owns the splash duration locally so the splash
 * always shows for a minimum time, independent of the child screen's internal
 * timer.
 *
 * After the minimum display time and all async checks complete:
 *   1. If the user has a stored session → restore it (check profile completeness
 *      to decide between create-profile or customer-home).
 *   2. Otherwise → onboarding (first launch) or Auth Entry (returning user).
 */
export default function SplashRoute() {
  const router = useRouter();
  const { hasCompletedOnboarding, isLoading: onboardingLoading } = useOnboardingStorage();
  const [minElapsed, setMinElapsed] = useState(false);
  const navigated = useRef(false);

  const handleAuthCheckComplete = useCallback(() => {
    // Splash timing is owned by this route; the child's callback is a no-op.
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (navigated.current || !minElapsed || onboardingLoading) {
      return;
    }

    const decideNavigation = async () => {
      navigated.current = true;

      try {
        const sessionExists = await hasSession();
        if (sessionExists) {
          console.log('[SplashRoute] Session exists, restoring...');
          try {
            const profile = await getUserProfile();
            if (isProfileComplete(profile)) {
              console.log('[SplashRoute] Profile complete, navigating to customer-home');
              router.replace('/customer-home');
            } else {
              console.log('[SplashRoute] Profile incomplete, navigating to create-profile');
              router.replace('/create-profile');
            }
          } catch (err) {
            console.log('[SplashRoute] Profile fetch failed, err:', err);
            if (err instanceof ApiError && err.statusCode === 401) {
              await clearSession();
              router.replace('/(auth)/welcome');
            } else {
              router.replace('/create-profile');
            }
          }
        } else if (hasCompletedOnboarding) {
          console.log('[SplashRoute] No session, onboarding completed, navigating to welcome');
          router.replace('/(auth)/welcome');
        } else {
          console.log('[SplashRoute] No session, onboarding not completed, navigating to onboarding');
          router.replace('/(onboarding)/onboarding');
        }
      } catch {
        // Fallback: if session check itself fails, go to welcome
        console.log('[SplashRoute] Session check failed, navigating to welcome');
        router.replace('/(auth)/welcome');
      }
    };

    decideNavigation();
  }, [minElapsed, onboardingLoading, hasCompletedOnboarding, router]);

  return <SplashScreen onAuthCheckComplete={handleAuthCheckComplete} />;
}
