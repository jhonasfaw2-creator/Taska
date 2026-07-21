import { useEffect, useCallback } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

type AuthCheckCallback = (
  isAuthenticated: boolean
) => 'Onboarding' | 'Home' | 'Auth' | 'Main';

interface UseSplashNavigationOptions {
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>;
  checkAuthStatus: () => Promise<boolean>;
  minDisplayTime?: number;
  onNavigate?: (route: string) => void;
}

const useSplashNavigation = ({
  navigationRef,
  checkAuthStatus,
  minDisplayTime = 2000,
  onNavigate,
}: UseSplashNavigationOptions) => {
  const handleNavigation = useCallback(
    async (authStatus: boolean) => {
      const route: AuthCheckCallback = (isAuthenticated: boolean) => {
        if (isAuthenticated) {
          return 'Home';
        }
        return 'Auth';
      };

      const targetRoute = route(authStatus);

      if (onNavigate) {
        onNavigate(targetRoute);
      }

      if (navigationRef.current?.isReady()) {
        navigationRef.current.resetRoot({
          index: 0,
          routes: [{ name: targetRoute as keyof RootStackParamList }],
        });
      }
    },
    [navigationRef, onNavigate]
  );

  useEffect(() => {
    let isMounted = true;

    const bootstrapAsync = async () => {
      try {
        const startTime = Date.now();
        const isAuthenticated = await checkAuthStatus();
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDisplayTime - elapsed);

        setTimeout(async () => {
          if (isMounted) {
            await handleNavigation(isAuthenticated);
          }
        }, remaining);
      } catch (error) {
        console.error('[Splash] Auth check failed:', error);
        if (isMounted) {
          await handleNavigation(false);
        }
      }
    };

    bootstrapAsync();

    return () => {
      isMounted = false;
    };
  }, [checkAuthStatus, handleNavigation, minDisplayTime]);

  return { handleNavigation };
};

export default useSplashNavigation;
