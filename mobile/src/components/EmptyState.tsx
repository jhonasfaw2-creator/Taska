import { View } from 'react-native';
import { Typography } from '@/components/ui';
import { Icon, type MobileIconName } from './Icon';

interface EmptyStateProps {
  icon?: MobileIconName;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = 'tasks', title, subtitle }: EmptyStateProps) {
  return (
    <View className="items-center rounded-2xl border border-dashed border-border bg-surface px-lg py-xl">
      <View className="mb-md h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Icon name={icon} size={32} color="#2563EB" accessibilityLabel="" />
      </View>
      <Typography variant="body" weight="semibold" className="text-center text-text-primary">
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="secondary" className="mt-sm max-w-xs text-center leading-relaxed">
          {subtitle}
        </Typography>
      )}
    </View>
  );
}
