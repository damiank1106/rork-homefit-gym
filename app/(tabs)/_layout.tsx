import { Tabs } from 'expo-router';
import { Home, Dumbbell, User, BarChart3, Settings } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions, Platform } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isSmallScreen = width < 768;
  const isWeb = Platform.OS === 'web';
  
  // Show label on Web or Big Screen. Hide on Small Screen (Mobile App).
  const showSettingsLabel = isWeb || !isSmallScreen;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconWrapper}>
              <Home size={size} color={color} strokeWidth={2.2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(exercises)"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconWrapper}>
              <Dumbbell size={size} color={color} strokeWidth={2.2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(charts)"
        options={{
          title: 'Charts',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconWrapper}>
              <BarChart3 size={size} color={color} strokeWidth={2.2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconWrapper}>
              <User size={size} color={color} strokeWidth={2.2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: showSettingsLabel ? 'Settings' : () => null,
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconWrapper}>
              <Settings size={size} color={color} strokeWidth={2.2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderTopWidth: 0,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
