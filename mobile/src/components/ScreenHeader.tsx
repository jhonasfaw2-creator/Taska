import { View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/ui';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export function ScreenHeader({ title, subtitle, onBack }: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = onBack ?? (() => router.back());

  return (
    <View className="px-screen-padding pt-md">
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={handleBack}
        className="mb-xl h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-60"
        hitSlop={8}
      >
        <Typography variant="body" weight="medium" className="text-text-primary">
          ←
        </Typography>
      </TouchableOpacity>

      <Typography variant="h2" weight="bold" className="text-text-primary">
        {title}
      </Typography>

      {subtitle && (
        <View className="mt-sm">
          <Typography variant="body" color="secondary" className="leading-relaxed">
            {subtitle}
          </Typography>
        </View>
      )}
    </View>
  );
}
