import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  useColorScheme,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, OnboardingSlide, PaginationDots } from '@/components';
import { ONBOARDING_SLIDES } from './onboarding/onboardingData';
import { useOnboardingStorage } from './onboarding/useOnboardingStorage';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();

  const { completeOnboarding } = useOnboardingStorage();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const total = ONBOARDING_SLIDES.length;
  const isLastSlide = activeIndex === total - 1;

  const goToSlide = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, total - 1));
      setActiveIndex(clamped);
      scrollRef.current?.scrollTo({ x: clamped * width, animated: true });
    },
    [total, width]
  );

  const updateIndexFromOffset = useCallback(
    (contentOffsetX: number) => {
      const index = Math.round(contentOffsetX / width);
      const clamped = Math.max(0, Math.min(index, total - 1));
      setActiveIndex((prev) => (prev === clamped ? prev : clamped));
    },
    [total, width]
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      updateIndexFromOffset(event.nativeEvent.contentOffset.x);
    },
    [updateIndexFromOffset]
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      updateIndexFromOffset(event.nativeEvent.contentOffset.x);
    },
    [updateIndexFromOffset]
  );

  const finishOnboarding = useCallback(async () => {
    await completeOnboarding();
    onComplete();
  }, [completeOnboarding, onComplete]);

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      finishOnboarding();
    } else {
      goToSlide(activeIndex + 1);
    }
  }, [isLastSlide, finishOnboarding, goToSlide, activeIndex]);

  const handleSkip = useCallback(() => {
    finishOnboarding();
  }, [finishOnboarding]);

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-background' : 'bg-background'}`}
      edges={['top', 'bottom']}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <View className="flex-row items-center justify-between px-md pt-md">
        <View style={{ width: 64 }} />
        {!isLastSlide && (
          <Button
            title="Skip"
            variant="text"
            size="sm"
            onPress={handleSkip}
            testID="onboarding-skip"
          />
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        decelerationRate="fast"
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        testID="onboarding-scroll-view"
      >
        {ONBOARDING_SLIDES.map((slide, index) => (
          <View key={slide.id} style={{ width }}>
            <OnboardingSlide
              data={slide}
              testID={`onboarding-slide-${index}`}
            />
          </View>
        ))}
      </ScrollView>

      <View className="w-full px-screen-padding pb-2xl pt-xl">
        <PaginationDots
          count={total}
          activeIndex={activeIndex}
          style={{ marginBottom: 32 }}
          testID="onboarding-pagination"
        />

        <Button
          title={isLastSlide ? 'Get Started' : 'Next'}
          variant="primary"
          fullWidth
          onPress={handleNext}
          testID="onboarding-next"
        />
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
