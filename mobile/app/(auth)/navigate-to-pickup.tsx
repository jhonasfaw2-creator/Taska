import { useCallback, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Button, Typography } from '@/components/ui';

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CUSTOMER = {
  name: 'Sarah Mekonnen',
  rating: 4.9,
};

const MOCK_PICKUP = {
  address: 'Addis Grocery Mart, Bole Road, Addis Ababa',
};

const MOCK_NAV = {
  eta: '8 min',
  distance: '2.3 km',
};

// ── Screen Component ─────────────────────────────────────────────────────────

export default function NavigateToPickupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [panelExpanded, setPanelExpanded] = useState(false);

  const togglePanel = useCallback(() => {
    setPanelExpanded((prev) => !prev);
  }, []);

  // ── Action Handlers ─────────────────────────────────────────────────────────

  const handleOpenMaps = useCallback(() => {
    const encodedAddress = encodeURIComponent(MOCK_PICKUP.address);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open Google Maps.');
    });
  }, []);

  const handleCallCustomer = useCallback(() => {
    Linking.openURL('tel:+251911234567').catch(() => {
      Alert.alert('Error', 'Unable to make a phone call on this device.');
    });
  }, []);

  const handleChat = useCallback(() => {
    Alert.alert('Chat', 'Chat feature coming soon.');
  }, []);

  const handleArrived = useCallback(() => {
    router.push('/pickup-confirmation');
  }, [router]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-background">
      {/* ── Full-Screen Map Placeholder ──────────────────────────── */}
      <View className="absolute inset-0 bg-surface">
          {/* Map tint overlay */}
        <View className="absolute inset-0 bg-primary/[0.03]" />

        {/* Road lines suggestion */}
        <View className="absolute inset-0 opacity-[0.06]">
          <View className="absolute left-1/4 right-0 top-1/3 h-px bg-text-primary" />
          <View className="absolute left-1/3 right-1/4 top-1/2 h-px bg-text-primary" />
          <View className="absolute left-1/2 right-0 top-2/3 h-px bg-text-primary" />
          <View className="absolute left-0 right-2/3 top-1/4 h-px bg-text-primary" />
        </View>

        {/* ── Top Bar (back + title overlay) ──────────────────────── */}
        <View
          className="absolute left-0 right-0 flex-row items-center px-screen-padding"
          style={{ top: insets.top + 8 }}
        >
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            testID="nav-pickup-back-button"
            className="h-11 w-11 items-center justify-center rounded-full bg-background/90 shadow-sm"
            activeOpacity={0.7}
            hitSlop={8}
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </TouchableOpacity>

          <View className="ml-md flex-1 rounded-xl bg-background/90 px-md py-sm shadow-sm">
            <View className="flex-row items-center gap-sm">
              <Typography variant="caption" weight="semibold" className="text-success-700">
                🟢
              </Typography>
              <Typography variant="caption" weight="semibold" className="text-text-primary">
                Navigating to Pickup
              </Typography>
            </View>
            <Typography variant="caption" color="secondary" className="mt-0.5">
              ETA: {MOCK_NAV.eta} · {MOCK_NAV.distance}
            </Typography>
          </View>
        </View>

        {/* ── Map Markers (visual placeholders) ───────────────────── */}

        {/* Tasker current location (bottom-left area) */}
        <View className="absolute bottom-[30%] left-[10%] items-center">
          {/* Pulse ring */}
          <View className="absolute h-16 w-16 rounded-full bg-primary/20" />
          <View className="absolute h-10 w-10 rounded-full bg-primary/30" />
          {/* Dot */}
          <View className="h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary shadow-md">
            <View className="h-2 w-2 rounded-full bg-background" />
          </View>
          <View className="mt-1 rounded-md bg-background/90 px-sm py-px shadow-sm">
            <Typography
              variant="caption"
              weight="semibold"
              className="text-primary"
              style={{ fontSize: 9 }}
            >
              You
            </Typography>
          </View>
        </View>

        {/* Route dashed line (visual suggestion) */}
        <View className="absolute bottom-1/3 left-[30%] right-[15%]">
          <View className="h-px border-b-2 border-dashed border-primary/40" />
          {/* Small direction arrow */}
          <View className="absolute -right-2 -top-2.5">
            <Typography variant="caption" className="text-primary/40">
              ▶
            </Typography>
          </View>
        </View>

        {/* Pickup location (top-right area) */}
        <View className="absolute right-[10%] top-[15%] items-center">
          {/* Pulse ring */}
          <View className="absolute h-20 w-20 rounded-full bg-success-100/50" />
          <View className="absolute h-12 w-12 rounded-full bg-success-100/70" />
          {/* Marker pin */}
          <View className="items-center">
            <View className="h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-success shadow-md">
              <Typography
                variant="caption"
                weight="bold"
                className="text-background"
                style={{ fontSize: 10 }}
              >
                A
              </Typography>
            </View>
            <View className="h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-success" />
          </View>
          <View className="mt-1 rounded-md bg-background/90 px-sm py-px shadow-sm">
            <Typography
              variant="caption"
              weight="semibold"
              className="text-success-700"
              style={{ fontSize: 9 }}
            >
              Pickup
            </Typography>
          </View>
        </View>
      </View>

      {/* ── Bottom Panel (overlaid on map) ────────────────────────── */}
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
              {MOCK_NAV.eta} to pickup
            </Typography>
          </View>
        </TouchableOpacity>

        {/* Panel content */}
        <View className="rounded-t-3xl bg-background shadow-xl">
          <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEnabled={panelExpanded}
            className="max-h-[460px]"
          >
            <View className="px-lg pb-lg pt-sm">
              {/* ── Customer + Pickup Info ─────────────────────────── */}

              {/* Customer row */}
              <View className="flex-row items-center gap-md pb-md">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Typography variant="h2">👤</Typography>
                </View>
                <View className="flex-1">
                  <Typography variant="body" weight="semibold" className="text-text-primary">
                    {MOCK_CUSTOMER.name}
                  </Typography>
                  <View className="mt-0.5 flex-row items-center gap-1">
                    <Typography variant="caption" className="text-warning">
                      ★
                    </Typography>
                    <Typography variant="caption" weight="semibold" className="text-text-primary">
                      {MOCK_CUSTOMER.rating.toFixed(1)}
                    </Typography>
                  </View>
                </View>
              </View>

              {/* Divider */}
              <View className="mb-md border-b border-border" />

              {/* Pickup address */}
              <View className="flex-row gap-md pb-md">
                <View className="items-center">
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-success-100">
                    <Typography
                      variant="caption"
                      weight="bold"
                      className="text-success-700"
                      style={{ fontSize: 10 }}
                    >
                      A
                    </Typography>
                  </View>
                </View>
                <View className="flex-1">
                  <Typography variant="caption" weight="semibold" className="mb-1 text-success-700">
                    Pickup Address
                  </Typography>
                  <Typography variant="caption" color="secondary" className="leading-relaxed">
                    {MOCK_PICKUP.address}
                  </Typography>
                </View>
              </View>

              {/* Divider */}
              <View className="mb-md border-b border-border" />

              {/* ETA + Distance row */}
              <View className="mb-md flex-row gap-md">
                <View className="flex-1 flex-row items-center gap-sm rounded-xl bg-primary/5 px-md py-md">
                  <Typography variant="body">⏱</Typography>
                  <View>
                    <Typography variant="caption" color="secondary">
                      ETA
                    </Typography>
                    <Typography variant="body" weight="bold" className="text-primary">
                      {MOCK_NAV.eta}
                    </Typography>
                  </View>
                </View>
                <View className="flex-1 flex-row items-center gap-sm rounded-xl bg-primary/5 px-md py-md">
                  <Typography variant="body">📍</Typography>
                  <View>
                    <Typography variant="caption" color="secondary">
                      Distance
                    </Typography>
                    <Typography variant="body" weight="bold" className="text-primary">
                      {MOCK_NAV.distance}
                    </Typography>
                  </View>
                </View>
              </View>

              {/* ── Action Icons Row ───────────────────────────────── */}
              <View className="mb-lg flex-row gap-md">
                {/* Open in Google Maps */}
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Open in Google Maps"
                  onPress={handleOpenMaps}
                  activeOpacity={0.7}
                  testID="nav-pickup-open-maps"
                  className="flex-1 items-center rounded-xl border border-border bg-surface px-sm py-md"
                >
                  <Typography variant="body" className="mb-1">
                    🗺️
                  </Typography>
                  <Typography
                    variant="caption"
                    weight="medium"
                    className="text-center text-text-primary"
                    style={{ fontSize: 10 }}
                  >
                    Google Maps
                  </Typography>
                </TouchableOpacity>

                {/* Call Customer */}
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Call customer"
                  onPress={handleCallCustomer}
                  activeOpacity={0.7}
                  testID="nav-pickup-call"
                  className="flex-1 items-center rounded-xl border border-border bg-surface px-sm py-md"
                >
                  <Typography variant="body" className="mb-1">
                    📞
                  </Typography>
                  <Typography
                    variant="caption"
                    weight="medium"
                    className="text-center text-text-primary"
                    style={{ fontSize: 10 }}
                  >
                    Call
                  </Typography>
                </TouchableOpacity>

                {/* Chat */}
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Chat with customer"
                  onPress={handleChat}
                  activeOpacity={0.7}
                  testID="nav-pickup-chat"
                  className="flex-1 items-center rounded-xl border border-border bg-surface px-sm py-md"
                >
                  <Typography variant="body" className="mb-1">
                    💬
                  </Typography>
                  <Typography
                    variant="caption"
                    weight="medium"
                    className="text-center text-text-primary"
                    style={{ fontSize: 10 }}
                  >
                    Chat
                  </Typography>
                </TouchableOpacity>
              </View>

              {/* ── I've Arrived Button ────────────────────────────── */}
              <Button
                label="I've Arrived"
                radius="lg"
                shadow="lg"
                leftIcon={
                  <Typography variant="body" className="text-background">
                    📍
                  </Typography>
                }
                onPress={handleArrived}
                testID="nav-pickup-arrived"
              />

              {/* Spacer for safe area */}
              {insets.bottom > 0 && <View className="h-sm" />}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
