import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  useColorScheme,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lightTheme, darkTheme } from '../theme/tokens';
import { Logo, LoadingIndicator } from '../components';

interface SplashScreenProps {
  onAuthCheckComplete?: (isAuthenticated: boolean) => void;
}

const checkAuthentication = async (): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return false;
};

const SplashScreen: React.FC<SplashScreenProps> = ({ onAuthCheckComplete }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

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
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
      edges={['top', 'bottom']}
    >
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      <View
        style={[
          styles.content,
          { paddingHorizontal: theme.spacing.xxl },
        ]}
      >
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Logo size={theme.spacing.xxl * 3} theme={theme} />
        </Animated.View>

        <Animated.View
          style={[
            styles.textWrapper,
            {
              opacity: fadeAnim,
              marginTop: theme.spacing.lg,
            },
          ]}
        >
          <Text
            style={[
              styles.appName,
              {
                color: theme.colors.textPrimary,
                fontSize: theme.typography.fontSize.display,
                fontWeight: theme.typography.fontWeight.bold,
              },
            ]}
          >
            Taska
          </Text>

          <Animated.View
            style={[
              styles.taglineWrapper,
              {
                opacity: taglineFadeAnim,
                marginTop: theme.spacing.sm,
              },
            ]}
          >
            <Text
              style={[
                styles.tagline,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.fontSize.body,
                  fontWeight: theme.typography.fontWeight.medium,
                },
              ]}
            >
              Your time. Your tasks. Done.
            </Text>
          </Animated.View>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.loaderWrapper,
          {
            opacity: loaderFadeAnim,
            paddingBottom: theme.spacing.xxl,
          },
        ]}
      >
        <LoadingIndicator theme={theme} />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  taglineWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagline: {
    textAlign: 'center',
  },
  loaderWrapper: {
    justifyContent: 'flex-end',
  },
});

export default SplashScreen;
