import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Typography } from '@/components/ui';
import { onStatusChange } from '@/services/socket.service';
import type { ConnectionStatus } from '@/services/socket.service';

const STATUS_CONFIG: Record<ConnectionStatus, { bg: string; dot: string; label: string; text: string }> = {
  connected: { bg: 'bg-success/10', dot: 'bg-success', label: 'Connected', text: 'text-success' },
  reconnecting: { bg: 'bg-warning/10', dot: 'bg-warning', label: 'Reconnecting', text: 'text-warning' },
  offline: { bg: 'bg-error/10', dot: 'bg-error', label: 'Offline', text: 'text-error' },
};

export default function ConnectionIndicator() {
  const [status, setStatus] = useState<ConnectionStatus>('offline');

  useEffect(() => {
    const unsubscribe = onStatusChange(setStatus);
    return unsubscribe;
  }, []);

  const config = STATUS_CONFIG[status];

  // Don't show anything when connected — only show issues
  if (status === 'connected') return null;

  return (
    <View className={`flex-row items-center justify-center gap-sm px-md py-1 rounded-full ${config.bg}`}>
      <View className={`h-2 w-2 rounded-full ${config.dot}`} />
      <Typography variant="caption" weight="medium" className={config.text}>
        {config.label}
      </Typography>
    </View>
  );
}
