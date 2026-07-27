import '../global.css';

import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { ThemeProvider } from '@/theme';
import { getAccessToken, hasSession, setTokenProvider } from '@/services';
import { TaskProvider } from '@/store/TaskContext';
import { initializeNotifications } from '@/services/notification.service';
import { connectSocket } from '@/services/socket.service';
import ConnectionIndicator from '@/components/ConnectionIndicator';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const connectedRef = useRef(false);

  const [fontsLoaded] = useFonts({
    Inter: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
    'Inter-Medium': require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
    'Inter-SemiBold': require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
    'Inter-Bold': require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
  });

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

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

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