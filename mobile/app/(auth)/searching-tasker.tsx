import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Animated,
  Easing,
  Alert,
  InteractionManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Typography } from '@/components/ui';

const PROGRESS_MESSAGES = [
  'Finding nearby taskers...',
  'Sending task requests...',
  'Waiting for a tasker to accept...',
];

const MESSAGE_INTERVAL_MS = 2500;
const AUTO_NAVIGATE_DELAY_MS = 5000;

const ESTIMATED_WAIT_MIN = 1;
const ESTIMATED_WAIT_MAX = 3;
const NEARBY_TASKERS = 12;

export default function SearchingTaskerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [messageIndex, setMessageIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasNavigated = useRef(false);

  // Pulsing ring animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Spinning ring animation
  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, [spinAnim]);

  // Fade-in on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Rotate interpolation for spinning ring
  const spinInterpolation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Cycling progress messages
  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % PROGRESS_MESSAGES.length);
    }, MESSAGE_INTERVAL_MS);
    return () => clearInterval(messageTimer);
  }, []);

  // Elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-navigate to task accepted after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        // Use InteractionManager to ensure smooth transition
        InteractionManager.runAfterInteractions(() => {
          router.replace('/task-accepted');
        });
      }
    }, AUTO_NAVIGATE_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [router]);

  const handleCancelTask = useCallback(() => {
    Alert.alert(
      'Cancel Task',
      'Are you sure you want to cancel this task? Your task posting will be removed and you will not be charged.',
      [
        { text: 'Keep Searching', style: 'cancel' },
        {
          text: 'Cancel Task',
          style: 'destructive',
          onPress: () => {
            hasNavigated.current = true;
            router.replace('/customer-home');
          },
        },
      ],
    );
  }, [router]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Animated.View
        className="flex-1 items-center justify-center px-screen-padding"
        style={{ opacity: fadeAnim }}
      >
        {/* Animated searching indicator */}
        <View className="mb-xl items-center justify-center">
          {/* Outer spinning ring */}
          <Animated.View
            className="absolute h-28 w-28 rounded-full border-2 border-primary/20"
            style={{
              transform: [{ rotate: spinInterpolation }],
              borderTopColor: '#4F46E5',
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent',
            }}
          />

          {/* Inner pulsing ring */}
          <Animated.View
            className="h-20 w-20 items-center justify-center rounded-full bg-primary/10"
            style={{ transform: [{ scale: pulseAnim }] }}
          >
            <Animated.View className="h-14 w-14 items-center justify-center rounded-full bg-primary/20">
              <Typography variant="h1" className="text-primary">
                🔍
              </Typography>
            </Animated.View>
          </Animated.View>
        </View>

        {/* Title */}
        <Typography variant="h2" weight="bold" className="text-center text-text-primary">
          Finding a tasker...
        </Typography>

        {/* Subtitle */}
        <View className="mt-sm">
          <Typography variant="body" color="secondary" className="text-center leading-relaxed">
            We&apos;re notifying nearby verified taskers.
          </Typography>
        </View>

        {/* Progress message */}
        <View className="mt-lg h-8 items-center justify-center">
          <Typography
            variant="body"
            weight="medium"
            className="text-center text-primary"
            key={messageIndex}
          >
            {PROGRESS_MESSAGES[messageIndex]}
          </Typography>
        </View>

        {/* Stats row */}
        <View className="mt-xl flex-row gap-lg">
          {/* Nearby taskers */}
          <View className="items-center rounded-2xl border border-border bg-surface px-xl py-lg">
            <Typography variant="h2" weight="bold" className="text-primary">
              {NEARBY_TASKERS}
            </Typography>
            <Typography variant="caption" color="secondary" className="mt-xs text-center">
              Nearby{'\n'}taskers
            </Typography>
          </View>

          {/* Estimated wait time */}
          <View className="items-center rounded-2xl border border-border bg-surface px-xl py-lg">
            <Typography variant="h2" weight="bold" className="text-primary">
              {ESTIMATED_WAIT_MIN}–{ESTIMATED_WAIT_MAX}
            </Typography>
            <Typography variant="caption" color="secondary" className="mt-xs text-center">
              Estimated{'\n'}minutes
            </Typography>
          </View>

          {/* Elapsed time */}
          <View className="items-center rounded-2xl border border-border bg-surface px-xl py-lg">
            <Typography variant="h2" weight="bold" className="text-primary">
              {formatTime(elapsedSeconds)}
            </Typography>
            <Typography variant="caption" color="secondary" className="mt-xs text-center">
              Elapsed{'\n'}time
            </Typography>
          </View>
        </View>

        {/* Reassuring message */}
        <View className="mt-xl max-w-xs">
          <Typography variant="caption" color="secondary" className="text-center leading-relaxed">
            Hang tight! A tasker will be assigned to you shortly. You can track their progress once accepted.
          </Typography>
        </View>
      </Animated.View>

      {/* Cancel Task button */}
      <View
        className="px-screen-padding pb-xl pt-lg"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Button
          label="Cancel Task"
          variant="outline"
          radius="lg"
          onPress={handleCancelTask}
          testID="searching-tasker-cancel"
        />
      </View>
    </View>
  );
}
