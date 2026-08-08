import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Typography } from '@/components/ui';
import NewLogo from '@/components/ui/Logo';

export interface OnboardingSlideData {
  id: string;
  title: string;
  description: string;
  illustration?: React.ReactNode;
}

interface OnboardingSlideProps {
  data: OnboardingSlideData;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  illustrationStyle?: ViewStyle;
  testID?: string;
}

const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  data,
  style,
  contentContainerStyle,
  illustrationStyle,
  testID,
}) => {
  return (
    <View
      className="flex-1 items-center justify-center px-screen-padding"
      style={style}
      testID={testID}
      accessible
      accessibilityLabel={`${data.title}. ${data.description}`}
    >
      <View
        className="mb-2xl items-center justify-center"
        style={illustrationStyle}
      >
        {data.illustration ?? <NewLogo size={120} />}
      </View>

      <View style={[contentContainerStyle, { width: '100%' }]}>
        <Typography variant="h2" weight="bold" className="mt-lg text-text-primary">
          {data.title}
        </Typography>

        <Typography variant="body" color="secondary" className="mt-md leading-relaxed">
          {data.description}
        </Typography>
      </View>
    </View>
  );
};

export default OnboardingSlide;
