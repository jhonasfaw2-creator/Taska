import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Typography } from '@/components/ui';
import { onStatusChange } from '@/services/socket.service';
import type { ConnectionStatus } from '@/services/socket.service';

const STATUS_CONFIG: Record<ConnectionStatus, { bg: string; dot: string; label: string }> = {
  connected: { bg: 'bg-green-100', dot: 'bg-green-500', label: 'Connected' },
  reconnecting: { bg: 'bg-yellow-100', dot: 'bg-yellow-500', label: 'Reconnecting' },
  offline: { bg: 'bg-red-100', dot: 'bg-red-500', label: 'Offline' },
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
    <View className={`flex-row items-center justify-center gap-sm px-md py-1 ${config.bg}`}>
      <View className={`h-2 w-2 rounded-full ${config.dot}`} />
      <Typography variant="caption" weight="medium" className={config.dot.replace('bg-', 'text-')}>
        {config.label}
      </Typography>
    </View>
  );
}
