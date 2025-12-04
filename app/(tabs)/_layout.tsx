import { Tabs } from 'expo-router';
import { Home, Dumbbell, User, BarChart3 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Colors from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
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
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 0,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
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
