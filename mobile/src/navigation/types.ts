import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Home: undefined;
  Main: undefined;
};

export type SplashScreenProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;
export type AuthScreenProps = NativeStackScreenProps<RootStackParamList, 'Auth'>;
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;
