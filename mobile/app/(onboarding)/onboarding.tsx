import { useRouter } from 'expo-router';
import OnboardingScreen from '@/screens/OnboardingScreen';

/**
 * Onboarding route. Renders the existing 3-page OnboardingScreen. When the
 * user finishes ("Get Started" / Skip), onboarding completion is already
 * persisted by the screen, so we just navigate to the Auth Entry.
 */
export default function OnboardingRoute() {
  const router = useRouter();

  return (
    <OnboardingScreen onComplete={() => router.replace('/(auth)/welcome')} />
  );
}
