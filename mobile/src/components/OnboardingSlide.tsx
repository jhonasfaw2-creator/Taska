import React from 'react';
import { View, Text, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { Theme } from '../theme/types';
import Logo from './Logo';

export interface OnboardingSlideData {
  id: string;
  title: string;
  description: string;
  illustration?: React.ReactNode;
}

interface OnboardingSlideProps {
  data: OnboardingSlideData;
  theme: Theme;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  illustrationStyle?: ImageStyle;
  testID?: string;
}

const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  data,
  theme,
  style,
  contentContainerStyle,
  illustrationStyle,
  testID,
}) => {
  return (
    <View
      style={[styles.container, style]}
      testID={testID}
      accessible
      accessibilityLabel={`${data.title}. ${data.description}`}
    >
      <View
        style={[
          styles.illustrationWrapper,
          { marginBottom: theme.spacing.xxl },
          illustrationStyle,
        ]}
      >
        {data.illustration ?? <Logo size={theme.spacing.xxl * 3} theme={theme} />}
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.screenPadding }, contentContainerStyle]}>
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.textPrimary,
              fontSize: theme.typography.fontSize.h1,
              fontWeight: theme.typography.fontWeight.bold,
              marginTop: theme.spacing.lg,
            },
          ]}
        >
          {data.title}
        </Text>

        <Text
          style={[
            styles.description,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.body,
              fontWeight: theme.typography.fontWeight.regular,
              lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.body,
              marginTop: theme.spacing.md,
            },
          ]}
        >
          {data.description}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'flex-start',
  },
  title: {
    textAlign: 'left',
    letterSpacing: -0.5,
  },
  description: {
    textAlign: 'left',
  },
});

export default OnboardingSlide;
