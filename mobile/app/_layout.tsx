import '../global.css';

import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/theme';
import { getAccessToken, hasSession, setTokenProvider } from '@/services';
import { TaskProvider } from '@/store/TaskContext';
import { initializeNotifications } from '@/services/notification.service';
import { connectSocket } from '@/services/socket.service';
import ConnectionIndicator from '@/components/ConnectionIndicator';

export default function RootLayout() {
  const connectedRef = useRef(false);

  useEffect(() => {
    setTokenProvider(getAccessToken);

    // Delayed auth check + socket connect
    Promise.resolve().then(async () => {
      const loggedIn = await hasSession();
      if (loggedIn) {
        await initializeNotifications();
        connectSocket();
        connectedRef.current = true;
      }
    });
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <TaskProvider>
          <StatusBar style="auto" />
          <View className="flex-1 bg-background">
            <ConnectionIndicator />
            <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
          </View>
        </TaskProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
