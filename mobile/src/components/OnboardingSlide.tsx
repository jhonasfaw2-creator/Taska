import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Typography } from '@/components/ui';
import { Logo } from '@/components/ui/Logo';
import { Icon, type MobileIconName } from '@/components/Icon';

export interface OnboardingSlideData {
  id: string;
  title: string;
  description: string;
  icon?: MobileIconName;
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
        {data.illustration ?? (
          data.icon ? (
            <View className="h-32 w-32 items-center justify-center rounded-full bg-primary/10">
              <Icon name={data.icon} size={56} color="#2563EB" accessibilityLabel={data.title} />
            </View>
          ) : (
            <Logo size={120} />
          )
        )}
      </View>

      <View style={[contentContainerStyle, { width: '100%' }]}>
        <Typography variant="h2" weight="bold" className="text-center text-text-primary">
          {data.title}
        </Typography>

        <Typography variant="body" color="secondary" className="mt-md text-center leading-relaxed">
          {data.description}
        </Typography>
      </View>
    </View>
  );
};

export default OnboardingSlide;
