import { View } from 'react-native';
import { Typography } from '@/components/ui';

interface MapPlaceholderProps {
  label: string;
  subtitle?: string;
}

export function MapPlaceholder({ label, subtitle }: MapPlaceholderProps) {
  return (
    <View className="min-h-[200px] flex-1 overflow-hidden rounded-2xl border border-border bg-surface">
      <View className="flex-1 items-center justify-center px-md py-xl">
        <View className="items-center gap-md opacity-50">
          <Typography variant="h2" weight="bold" className="text-text-secondary">
            🗺️
          </Typography>
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
