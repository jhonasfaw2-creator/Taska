import { View , useColorScheme } from 'react-native';
import React, { createContext, useContext, useMemo } from 'react';
import { lightTheme, darkTheme } from './tokens';
import { Theme } from './types';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  isDark: false,
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Supplies the active theme (light/dark) derived from the device color scheme
 * and keeps the NativeWind `.dark` class in sync so Tailwind utilities resolve
 * the correct CSS variables.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const value = useMemo<ThemeContextValue>(
    () => ({ theme: isDark ? darkTheme : lightTheme, isDark }),
    [isDark]
  );

  return (
    <ThemeContext.Provider value={value}>
      <View className={isDark ? 'dark' : undefined} style={{ flex: 1 }}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => useContext(ThemeContext);

export default ThemeProvider;
