import { View } from 'react-native';
import { Typography } from '@/components/ui';
import { Icon } from './Icon';

interface MapPlaceholderProps {
  label: string;
  subtitle?: string;
}

export function MapPlaceholder({ label, subtitle }: MapPlaceholderProps) {
  return (
    <View className="min-h-[200px] flex-1 overflow-hidden rounded-2xl border border-border bg-surface">
      <View className="flex-1 items-center justify-center px-md py-xl">
        <View className="items-center gap-md opacity-50">
          <Icon name="map" size={40} color="#6B7280" accessibilityLabel="Map preview" />
          <Typography variant="body" color="secondary" className="text-center">
            {label}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="secondary" className="text-center">
              {subtitle}
            </Typography>
          )}
        </View>
      </View>
    </View>
  );
}
