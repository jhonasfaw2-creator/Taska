import React, { useEffect, useRef } from 'react';
import {
  View,
  StatusBar,
  useColorScheme,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui';
import { Logo } from '@/components/ui/Logo';

interface SplashScreenProps {
  onAuthCheckComplete?: (isAuthenticated: boolean) => void;
}

const checkAuthentication = async (): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return false;
};

const SplashScreen: React.FC<SplashScreenProps> = ({ onAuthCheckComplete }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const taglineFadeAnim = useRef(new Animated.Value(0)).current;
  const loaderFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const runAnimations = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.back(1.2)),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(taglineFadeAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(loaderFadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    };

    runAnimations();

    const simulateAuthCheck = async () => {
      try {
        const isAuthenticated = await checkAuthentication();
        onAuthCheckComplete?.(isAuthenticated);
      } catch (error) {
        console.error('[Splash] Authentication check failed:', error);
        onAuthCheckComplete?.(false);
      }
    };

    const timer = setTimeout(simulateAuthCheck, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, taglineFadeAnim, loaderFadeAnim, onAuthCheckComplete]);

  return (
    <View
      className="flex-1 items-center justify-center bg-background"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <Animated.View
        style={[
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Logo size={120} />
      </Animated.View>

      <Animated.View
        style={[
          {
            opacity: fadeAnim,
            marginTop: 24,
          },
        ]}
      >
        <Typography variant="display-lg" weight="bold" className="text-text-primary">
          Taska
        </Typography>

        <Animated.View
          style={[
            {
              opacity: taglineFadeAnim,
              marginTop: 12,
            },
          ]}
        >
          <Typography variant="body-lg" weight="medium" color="secondary">
            Your time. Your tasks. Done.
          </Typography>
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={[
          {
            opacity: loaderFadeAnim,
            marginTop: 48,
          },
        ]}
      >
        <View className="h-1.5 w-24 overflow-hidden rounded-full bg-neutral-200">
          <Animated.View
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 9999,
              backgroundColor: '#2563EB',
              opacity: loaderFadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
            }}
          />
        </View>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;
