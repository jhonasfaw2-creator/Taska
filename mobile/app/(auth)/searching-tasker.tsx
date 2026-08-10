import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Animated,
  Easing,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Button, Typography } from '@/components/ui';
import { onSocketEvent, joinTaskRoom, leaveTaskRoom } from '@/services/socket.service';

const PROGRESS_MESSAGES = [
  'Finding nearby taskers...',
  'Sending task requests...',
  'Waiting for a tasker to accept...',
];

const MESSAGE_INTERVAL_MS = 2500;

const ESTIMATED_WAIT_MIN = 1;
const ESTIMATED_WAIT_MAX = 3;
const NEARBY_TASKERS = 12;

export default function SearchingTaskerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { taskId } = useLocalSearchParams<{ taskId?: string }>();

  const [messageIndex, setMessageIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasNavigated = useRef(false);

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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const spinInterpolation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % PROGRESS_MESSAGES.length);
    }, MESSAGE_INTERVAL_MS);
    return () => clearInterval(messageTimer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (taskId) {
      joinTaskRoom(taskId);
    }

    const unsubAccepted = onSocketEvent('task_accepted', (data: any) => {
      if (!taskId || data.taskId === taskId) {
        if (!hasNavigated.current) {
          hasNavigated.current = true;
          router.replace(`/task-accepted?taskId=${data.taskId ?? taskId}`);
        }
      }
    });

    const unsubStatus = onSocketEvent('task_status_changed', (data: any) => {
      if (data.status === 'ACCEPTED' && (!taskId || data.taskId === taskId)) {
        if (!hasNavigated.current) {
          hasNavigated.current = true;
          router.replace(`/task-accepted?taskId=${data.taskId}`);
        }
      }
    });

    return () => {
      if (taskId) leaveTaskRoom(taskId);
      unsubAccepted();
      unsubStatus();
    };
  }, [router, taskId]);

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
      <View className="border-b border-border bg-background px-screen-padding pb-lg pt-sm">
        <View className="flex-row items-center">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            testID="searching-tasker-back"
            onPress={() => router.back()}
            className="mr-sm h-10 w-10 items-center justify-center rounded-xl active:opacity-60"
            hitSlop={8}
          >
            <ArrowLeft size={24} className="text-text-primary" />
          </TouchableOpacity>
          <View className="flex-1">
            <Typography variant="h3" weight="bold" className="text-text-primary">
              Finding a tasker...
            </Typography>
            <Typography variant="caption" color="secondary">
              We&apos;re notifying nearby verified taskers.
            </Typography>
          </View>
        </View>
      </View>

      <Animated.View
        className="flex-1 items-center justify-center px-screen-padding"
        style={{ opacity: fadeAnim }}
      >
        <View className="mb-xl items-center justify-center">
          <Animated.View
            className="absolute h-28 w-28 rounded-full border-2 border-primary/20"
            style={{
              transform: [{ rotate: spinInterpolation }],
              borderTopColor: '#2563EB',
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent',
            }}
          />

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

        <View className="mt-xl flex-row gap-lg">
          <View className="items-center rounded-2xl border border-border bg-surface px-xl py-lg">
            <Typography variant="h2" weight="bold" className="text-primary">
              {NEARBY_TASKERS}
            </Typography>
            <Typography variant="caption" color="secondary" className="mt-xs text-center">
              Nearby{'\n'}taskers
            </Typography>
          </View>

          <View className="items-center rounded-2xl border border-border bg-surface px-xl py-lg">
            <Typography variant="h2" weight="bold" className="text-primary">
              {ESTIMATED_WAIT_MIN}–{ESTIMATED_WAIT_MAX}
            </Typography>
            <Typography variant="caption" color="secondary" className="mt-xs text-center">
              Estimated{'\n'}minutes
            </Typography>
          </View>

          <View className="items-center rounded-2xl border border-border bg-surface px-xl py-lg">
            <Typography variant="h2" weight="bold" className="text-primary">
              {formatTime(elapsedSeconds)}
            </Typography>
            <Typography variant="caption" color="secondary" className="mt-xs text-center">
              Elapsed{'\n'}time
            </Typography>
          </View>
        </View>

        <View className="mt-xl max-w-xs">
          <Typography variant="caption" color="secondary" className="text-center leading-relaxed">
            Hang tight! A tasker will be assigned to you shortly. You can track their progress once accepted.
          </Typography>
        </View>
      </Animated.View>

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
