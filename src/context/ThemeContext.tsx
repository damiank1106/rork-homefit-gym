import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightColors, DarkColors } from '@/constants/colors';

type Theme = 'light' | 'dark';
type ThemeColors = typeof LightColors;

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  customIconColor: string | null;
  setCustomIconColor: (color: string | null) => void;
  customSwitchColor: string | null;
  setCustomSwitchColor: (color: string | null) => void;
  customContainerColor: string | null;
  setCustomContainerColor: (color: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'homefit_theme';
const CUSTOM_COLORS_STORAGE_KEY = 'homefit_custom_colors';

interface CustomColors {
  iconColor: string | null;
  switchColor: string | null;
  containerColor: string | null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('light'); // Default to light
  const [customIconColor, setCustomIconColorState] = useState<string | null>(null);
  const [customSwitchColor, setCustomSwitchColorState] = useState<string | null>(null);
  const [customContainerColor, setCustomContainerColorState] = useState<string | null>(null);

  const loadTheme = useCallback(async () => {
    try {
      const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      
      // Check for valid theme values
      if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
        setThemeState(storedTheme);
      } else if (storedTheme && storedTheme !== 'null' && storedTheme !== 'undefined') {
        // Invalid stored theme, clear it
        console.log('Invalid theme value in storage:', storedTheme);
        await AsyncStorage.removeItem(THEME_STORAGE_KEY);
        if (systemColorScheme) {
          setThemeState(systemColorScheme);
        }
      } else if (systemColorScheme) {
        setThemeState(systemColorScheme);
      }

      // Load custom colors
      const storedColors = await AsyncStorage.getItem(CUSTOM_COLORS_STORAGE_KEY);
      if (storedColors) {
        const parsedColors: CustomColors = JSON.parse(storedColors);
        setCustomIconColorState(parsedColors.iconColor || null);
        setCustomSwitchColorState(parsedColors.switchColor || null);
        setCustomContainerColorState(parsedColors.containerColor || null);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
      // Clear corrupted theme data
      try {
        await AsyncStorage.removeItem(THEME_STORAGE_KEY);
        await AsyncStorage.removeItem(CUSTOM_COLORS_STORAGE_KEY);
      } catch (clearError) {
        console.log('Error clearing theme:', clearError);
      }
    }
  }, [systemColorScheme]);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  const saveCustomColors = async (newColors: Partial<CustomColors>) => {
    try {
      const currentColors = {
        iconColor: customIconColor,
        switchColor: customSwitchColor,
        containerColor: customContainerColor,
        ...newColors
      };
      await AsyncStorage.setItem(CUSTOM_COLORS_STORAGE_KEY, JSON.stringify(currentColors));
    } catch (error) {
      console.log('Error saving custom colors:', error);
    }
  };

  const setCustomIconColor = (color: string | null) => {
    setCustomIconColorState(color);
    saveCustomColors({ iconColor: color });
  };

  const setCustomSwitchColor = (color: string | null) => {
    setCustomSwitchColorState(color);
    saveCustomColors({ switchColor: color });
  };

  const setCustomContainerColor = (color: string | null) => {
    setCustomContainerColorState(color);
    saveCustomColors({ containerColor: color });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme).catch((err) =>
      console.log('Error saving theme:', err)
    );
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const colors = theme === 'dark' ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      colors, 
      toggleTheme, 
      setTheme,
      customIconColor,
      setCustomIconColor,
      customSwitchColor,
      setCustomSwitchColor,
      customContainerColor,
      setCustomContainerColor
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
