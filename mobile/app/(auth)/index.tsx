import { Redirect } from 'expo-router';

/**
 * Entry point for the (auth) route group. The group has no index screen of its
 * own, so we redirect to the Auth Entry. This ensures the group's navigator is
 * mounted, giving nested routes (phone, otp, etc.) a navigation context.
 */
export default function AuthIndex() {
  return <Redirect href="/welcome" />;
}
