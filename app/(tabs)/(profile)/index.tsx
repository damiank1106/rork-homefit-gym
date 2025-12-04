import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Settings,
  Bell,
  HelpCircle,
  ChevronRight,
  Award,
  Calendar,
  Flame,
  Clock,
} from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function ProfileScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const MenuButton = ({
    icon: Icon,
    title,
    subtitle,
  }: {
    icon: React.ElementType;
    title: string;
    subtitle?: string;
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPressIn={() => {
            Animated.spring(scaleAnim, {
              toValue: 0.98,
              useNativeDriver: true,
            }).start();
          }}
          onPressOut={() => {
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 3,
              tension: 40,
              useNativeDriver: true,
            }).start();
          }}
          style={styles.menuButton}
        >
          <View style={styles.menuIconContainer}>
            <Icon size={20} color={Colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{title}</Text>
            {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </Pressable>
      </Animated.View>
    );
  };

  const StatCard = ({
    icon: Icon,
    value,
    label,
    color,
  }: {
    icon: React.ElementType;
    value: string;
    label: string;
    color: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Icon size={18} color={Colors.white} strokeWidth={2.2} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMiddle, Colors.background]}
      locations={[0, 0.3, 0.6]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Profile</Text>
            </View>

            <View style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  style={styles.avatar}
                >
                  <User size={40} color={Colors.white} strokeWidth={1.5} />
                </LinearGradient>
              </View>
              <Text style={styles.profileName}>Fitness Enthusiast</Text>
              <Text style={styles.profileEmail}>Welcome to HomeFit Gym</Text>
            </View>

            <View style={styles.statsRow}>
              <StatCard
                icon={Flame}
                value="7"
                label="Day Streak"
                color={Colors.warning}
              />
              <StatCard
                icon={Calendar}
                value="24"
                label="Workouts"
                color={Colors.secondary}
              />
              <StatCard
                icon={Clock}
                value="6.5h"
                label="Total Time"
                color={Colors.success}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settings</Text>
              <View style={styles.menuContainer}>
                <MenuButton
                  icon={User}
                  title="Account"
                  subtitle="Personal information"
                />
                <View style={styles.menuDivider} />
                <MenuButton
                  icon={Bell}
                  title="Notifications"
                  subtitle="Workout reminders"
                />
                <View style={styles.menuDivider} />
                <MenuButton
                  icon={Settings}
                  title="Preferences"
                  subtitle="App settings"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Support</Text>
              <View style={styles.menuContainer}>
                <MenuButton
                  icon={Award}
                  title="Achievements"
                  subtitle="View your badges"
                />
                <View style={styles.menuDivider} />
                <MenuButton
                  icon={HelpCircle}
                  title="Help Center"
                  subtitle="FAQs and support"
                />
              </View>
            </View>

            <Text style={styles.version}>HomeFit Gym v1.0.0</Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 24,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  menuContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 70,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 8,
  },
});
