import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  useColorScheme,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../theme/types';
import { lightTheme, darkTheme } from '../theme/tokens';
import { OnboardingSlide, PaginationDots, Button } from '../components';
import { ONBOARDING_SLIDES } from './onboarding/onboardingData';
import { useOnboardingStorage } from './onboarding/useOnboardingStorage';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const colorScheme = useColorScheme();
  const theme: Theme = colorScheme === 'dark' ? darkTheme : lightTheme;
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
    [width, total]
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
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'bottom']}
    >
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      <View style={styles.topBar}>
        <View style={styles.topBarSpacer} />
        {!isLastSlide && (
          <Button
            title="Skip"
            theme={theme}
            variant="text"
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
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        testID="onboarding-scroll-view"
      >
        {ONBOARDING_SLIDES.map((slide, index) => (
          <View key={slide.id} style={[styles.slideWrapper, { width }]}>
            <OnboardingSlide
              data={slide}
              theme={theme}
              testID={`onboarding-slide-${index}`}
            />
          </View>
        ))}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingHorizontal: theme.spacing.screenPadding, paddingBottom: theme.spacing.xl },
        ]}
      >
        <PaginationDots
          count={total}
          activeIndex={activeIndex}
          theme={theme}
          style={{ marginBottom: theme.spacing.xl }}
          testID="onboarding-pagination"
        />

        <Button
          title={isLastSlide ? 'Get Started' : 'Next'}
          theme={theme}
          variant="primary"
          fullWidth
          onPress={handleNext}
          testID="onboarding-next"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    minHeight: 48,
  },
  topBarSpacer: {
    width: 64,
  },
  scrollContent: {
    flexGrow: 1,
  },
  slideWrapper: {
    flex: 1,
  },
  footer: {
    width: '100%',
  },
});

export default OnboardingScreen;
