import { View } from 'react-native';
import { Typography } from '@/components/ui';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = '📋', title, subtitle }: EmptyStateProps) {
  return (
    <View className="items-center rounded-2xl border border-dashed border-border bg-surface px-lg py-xl">
      <View className="mb-md h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Typography variant="h1">{icon}</Typography>
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
