import { useCallback, useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Animated, Easing, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Button, Typography } from '@/components/ui';

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_TASKER = {
  name: 'Abebe Kebede',
  rating: 4.8,
  vehicle: 'Toyota Corolla (White)',
  plate: 'AA-1234-567',
  phone: '+251911234567',
};

const MOCK_TRIP = {
  eta: '8 min',
  distance: '2.3 km',
  pickupAddress: 'Bole, Addis Ababa, Ethiopia',
  dropoffAddress: 'Kazanchis, Addis Ababa, Ethiopia',
  currentStep: 'traveling_to_pickup' as const,
  // upcoming: 'traveling_to_dropoff' | 'picked_up' | 'completed'
};

type TripStep = 'tasker_accepted' | 'traveling_to_pickup' | 'arrived' | 'picked_up' | 'traveling_to_dropoff' | 'delivered';

const TRIP_STEPS: { key: TripStep; label: string }[] = [
  { key: 'tasker_accepted', label: 'Tasker assigned' },
  { key: 'traveling_to_pickup', label: 'Traveling to pickup' },
  { key: 'arrived', label: 'Arrived at location' },
  { key: 'picked_up', label: 'Item picked up' },
  { key: 'traveling_to_dropoff', label: 'Traveling to destination' },
  { key: 'delivered', label: 'Delivered' },
];

function TripProgressBar({ currentStep }: { currentStep: TripStep }) {
  const currentIdx = TRIP_STEPS.findIndex((s) => s.key === currentStep);

  return (
    <View className="px-sm py-md">
      {TRIP_STEPS.map((step, index) => {
        const isCompleted = index < currentIdx;
        const isCurrent = index === currentIdx;

        return (
          <View key={step.key} className="flex-row items-start">
            {/* Timeline column */}
            <View className="items-center" style={{ width: 28 }}>
              {/* Connector line above */}
              {index > 0 && (
                <View
                  className={`h-7 w-0.5 ${isCompleted || isCurrent ? 'bg-primary' : 'bg-border'}`}
                />
              )}

              {/* Dot */}
              <View
                className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                  isCompleted
                    ? 'border-primary bg-primary'
                    : isCurrent
                      ? 'border-primary bg-background'
                      : 'border-border bg-surface'
                }`}
              >
                {isCompleted ? (
                  <Typography variant="caption" weight="bold" className="text-background" style={{ fontSize: 10 }}>
                    ✓
                  </Typography>
                ) : (
                  <View className={`h-2 w-2 rounded-full ${isCurrent ? 'bg-primary' : 'bg-border'}`} />
                )}
              </View>

              {/* Connector below */}
              {index < TRIP_STEPS.length - 1 && (
                <View
                  className={`h-7 w-0.5 ${isCompleted ? 'bg-primary' : isCurrent ? 'bg-primary/30' : 'bg-border'}`}
                />
              )}
            </View>

            {/* Label */}
            <View className="ml-md flex-1 justify-center py-1">
              <Typography
                variant="caption"
                weight={isCompleted || isCurrent ? 'semibold' : 'regular'}
                className={isCompleted ? 'text-primary' : isCurrent ? 'text-text-primary' : 'text-text-secondary'}
              >
                {step.label}
              </Typography>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function LiveTrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [tripStep] = useState<TripStep>('traveling_to_pickup');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for the tasker dot
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const togglePanel = useCallback(() => setPanelExpanded((p) => !p), []);

  const handleContactTasker = useCallback(() => {
    // In production, navigate to chat
    Alert.alert('Chat', 'Chat feature coming soon.');
  }, []);

  const handleViewTaskDetails = useCallback(() => {
    router.push('/task-details');
  }, [router]);

  return (
    <View className="flex-1 bg-background">
      {/* ── Map Area ─────────────────────────────────────────────── */}
      <View className="absolute inset-0 bg-surface">
        <View className="absolute inset-0 bg-primary/[0.03]" />

        {/* Decorative road lines */}
        <View className="absolute inset-0 opacity-[0.06]">
          <View className="absolute left-0 right-1/3 top-1/4 h-px bg-text-primary" />
          <View className="absolute left-1/4 right-0 top-2/5 h-px bg-text-primary" />
          <View className="absolute left-1/3 right-0 top-3/5 h-px bg-text-primary" />
          <View className="absolute left-0 right-1/2 top-3/4 h-px bg-text-primary" />
        </View>

        {/* ── Top Bar ────────────────────────────────────────────── */}
        <View
          className="absolute left-0 right-0 flex-row items-center justify-between px-screen-padding"
          style={{ top: insets.top + 8 }}
        >
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            testID="live-tracking-back"
            className="h-11 w-11 items-center justify-center rounded-full bg-background/90 shadow-sm"
            activeOpacity={0.7}
            hitSlop={8}
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </TouchableOpacity>

          {/* Status badge */}
          <View className="rounded-full bg-background/90 px-md py-sm shadow-sm">
            <View className="flex-row items-center gap-xs">
              <View className="h-2 w-2 rounded-full bg-success" />
              <Typography variant="caption" weight="semibold" className="text-text-primary">
                Live
              </Typography>
            </View>
          </View>
        </View>

        {/* ── Map Markers ─────────────────────────────────────────── */}

        {/* Tasker current location (center-ish) */}
        <View className="absolute left-[30%] top-[35%] items-center">
          <Animated.View
            style={{
              position: 'absolute',
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              transform: [{ scale: pulseAnim }],
            }}
          />
          <View className="h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary shadow-md">
            <View className="h-2 w-2 rounded-full bg-background" />
          </View>
          <View className="mt-1 rounded-md bg-background/90 px-sm py-px shadow-sm">
            <Typography variant="caption" weight="semibold" className="text-primary" style={{ fontSize: 9 }}>
              Tasker
            </Typography>
          </View>
        </View>

        {/* Pickup location (top-right) */}
        <View className="absolute right-[12%] top-[18%] items-center">
          <View className="absolute h-16 w-16 rounded-full bg-success-100/50" />
          <View className="items-center">
            <View className="h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-success shadow-md">
              <Typography variant="caption" weight="bold" className="text-background" style={{ fontSize: 10 }}>
                A
              </Typography>
            </View>
            <View className="h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-success" />
          </View>
          <View className="mt-1 rounded-md bg-background/90 px-sm py-px shadow-sm">
            <Typography variant="caption" weight="semibold" className="text-success-700" style={{ fontSize: 9 }}>
              Pickup
            </Typography>
          </View>
        </View>

        {/* Dropoff location (bottom-left) */}
        <View className="absolute bottom-[28%] left-[10%] items-center">
          <View className="items-center">
            <View className="h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary/80 shadow-md">
              <Typography variant="caption" weight="bold" className="text-background" style={{ fontSize: 10 }}>
                B
              </Typography>
            </View>
            <View className="h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-primary/80" />
          </View>
          <View className="mt-1 rounded-md bg-background/90 px-sm py-px shadow-sm">
            <Typography variant="caption" weight="semibold" className="text-primary" style={{ fontSize: 9 }}>
              Drop-off
            </Typography>
          </View>
        </View>

        {/* Animated route line suggestion */}
        <View className="absolute left-[25%] right-[25%] top-[45%]">
          <View className="h-0.5 rounded-full bg-primary/30" style={{ transform: [{ rotate: '-15deg' }] }} />
        </View>
        <View className="absolute left-[20%] right-[20%] top-[55%]">
          <View className="h-0.5 rounded-full bg-primary/20" style={{ transform: [{ rotate: '10deg' }] }} />
        </View>
      </View>

      {/* ── Bottom Panel ─────────────────────────────────────────── */}
      <View
        className="absolute bottom-0 left-0 right-0"
        style={{ paddingBottom: insets.bottom }}
      >
        {/* Drag handle */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={panelExpanded ? 'Collapse panel' : 'Expand panel'}
          onPress={togglePanel}
          activeOpacity={0.8}
          className="items-center py-sm"
        >
          <View className="mb-xs h-1.5 w-12 rounded-full bg-text-secondary/30" />
          <View className="flex-row items-center gap-1">
            <View className="h-2 w-2 rounded-full bg-success" />
            <Typography variant="caption" weight="semibold" className="text-success-700">
              ETA: {MOCK_TRIP.eta} · {MOCK_TRIP.distance}
            </Typography>
          </View>
        </TouchableOpacity>

        {/* Panel content */}
        <View className="rounded-t-3xl bg-background shadow-xl">
          <View className="px-lg pb-lg pt-sm">
            {/* ── Tasker info card ──────────────────────────────────── */}
            <View className="mb-md flex-row items-center gap-md rounded-2xl border border-border bg-surface p-md">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Typography variant="h1">👤</Typography>
              </View>
              <View className="flex-1">
                <Typography variant="body" weight="semibold" className="text-text-primary">
                  {MOCK_TASKER.name}
                </Typography>
                <View className="mt-0.5 flex-row items-center gap-1">
                  <Typography variant="caption" className="text-warning">★</Typography>
                  <Typography variant="caption" weight="semibold" className="text-text-primary">
                    {MOCK_TASKER.rating.toFixed(1)}
                  </Typography>
                  <View className="mx-1 h-3 w-px bg-border" />
                  <Typography variant="caption" color="secondary">
                    {MOCK_TASKER.vehicle}
                  </Typography>
                </View>
                <Typography variant="caption" color="secondary" className="mt-0.5">
                  Plate: {MOCK_TASKER.plate}
                </Typography>
              </View>
            </View>

            {/* ── Location row ──────────────────────────────────────── */}
            <View className="mb-md flex-row gap-md">
              <View className="items-center">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-success-100">
                  <Typography variant="caption" weight="bold" className="text-success-700" style={{ fontSize: 10 }}>A</Typography>
                </View>
                <View className="my-1 h-8 w-0.5 bg-success-200" />
                <View className="h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <Typography variant="caption" weight="bold" className="text-primary" style={{ fontSize: 10 }}>B</Typography>
                </View>
              </View>
              <View className="flex-1">
                <Typography variant="caption" weight="semibold" className="mb-1 text-success-700">
                  Pickup
                </Typography>
                <Typography variant="caption" color="secondary" className="mb-2 leading-relaxed">
                  {MOCK_TRIP.pickupAddress}
                </Typography>
                <View className="border-b border-border" />
                <Typography variant="caption" weight="semibold" className="mb-1 mt-2 text-primary">
                  Drop-off
                </Typography>
                <Typography variant="caption" color="secondary" className="leading-relaxed">
                  {MOCK_TRIP.dropoffAddress}
                </Typography>
              </View>
            </View>

            {/* ── Progress tracker (collapsible) ───────────────────── */}
            {panelExpanded && (
              <View className="mb-md rounded-2xl border border-border bg-surface px-lg py-md">
                <Typography variant="caption" weight="semibold" className="mb-md uppercase tracking-wider text-text-secondary">
                  Trip Progress
                </Typography>
                <TripProgressBar currentStep={tripStep} />
              </View>
            )}

            {/* ── Action buttons ────────────────────────────────────── */}
            <View className="flex-row gap-md">
              <Button
                label="Contact"
                variant="outline"
                radius="lg"
                className="flex-1"
                leftIcon={<Typography variant="body" className="text-primary">💬</Typography>}
                onPress={handleContactTasker}
                testID="live-tracking-contact"
              />
              <Button
                label="View Details"
                variant="outline"
                radius="lg"
                className="flex-1"
                leftIcon={<Typography variant="body" className="text-primary">📋</Typography>}
                onPress={handleViewTaskDetails}
                testID="live-tracking-details"
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
