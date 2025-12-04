import React, { useEffect, useMemo, useState } from 'react';
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
  BarChart3,
  Clock,
  Flame,
  Sparkles,
  Trophy,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { ExerciseLog } from '@/src/types/history';
import { getExerciseLogs } from '@/src/storage/historyStorage';
import { getLocalDateString } from '@/src/utils/history';

const TAB_OPTIONS = [
  { key: 'calories', label: 'Calories', icon: Flame, color: Colors.warning },
  { key: 'duration', label: 'Time', icon: Clock, color: Colors.secondary },
  { key: 'workouts', label: 'Sessions', icon: Trophy, color: Colors.success },
] as const;

type TabKey = typeof TAB_OPTIONS[number]['key'];

export default function ChartsScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('calories');
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const loadLogs = async () => {
      const stored = await getExerciseLogs();
      setLogs(stored);
    };

    loadLogs();
  }, []);

  const dailyTotals = useMemo(() => {
    const today = new Date(getLocalDateString());
    const days: { label: string; value: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const label = date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
      const dayLogs = logs.filter((log) => log.date === dateKey);

      const calories = dayLogs.reduce((sum, log) => sum + (log.calories ?? 0), 0);
      const duration = dayLogs.reduce((sum, log) => sum + log.durationSeconds, 0) / 60;
      const workoutCount = dayLogs.length;

      days.push({
        label,
        value:
          activeTab === 'calories'
            ? Math.round(calories)
            : activeTab === 'duration'
              ? Math.round(duration)
              : workoutCount,
      });
    }

    return days;
  }, [activeTab, logs]);

  const totals = useMemo(() => {
    const calories = logs.reduce((sum, log) => sum + (log.calories ?? 0), 0);
    const minutes = logs.reduce((sum, log) => sum + log.durationSeconds, 0) / 60;
    const sessions = logs.length;

    return { calories: Math.round(calories), minutes: Math.round(minutes), sessions };
  }, [logs]);

  const maxValue = Math.max(...dailyTotals.map((d) => d.value), 1);
  const activeMeta = TAB_OPTIONS.find((tab) => tab.key === activeTab)!;

  const formatValue = (value: number) => {
    if (activeTab === 'duration') return `${value} min`;
    if (activeTab === 'calories') return `${value} kcal`;
    return `${value}x`;
  };

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMiddle, Colors.background]}
      locations={[0, 0.3, 0.6]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <BarChart3 size={22} color={Colors.primary} strokeWidth={2.2} />
                <Text style={styles.title}>Progress Charts</Text>
              </View>
              <Text style={styles.subtitle}>
                Celebrate every rep — your effort adds up faster than you think.
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.tabRow}>
                {TAB_OPTIONS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <Pressable
                      key={tab.key}
                      style={[styles.tabButton, isActive && styles.tabButtonActive]}
                      onPress={() => setActiveTab(tab.key)}
                    >
                      <Icon
                        size={16}
                        color={isActive ? Colors.white : Colors.textSecondary}
                        strokeWidth={2.2}
                      />
                      <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                        {tab.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.seriesHeader}>
                <Text style={styles.seriesTitle}>{activeMeta.label} this week</Text>
                <Text style={styles.seriesValue}>
                  {activeTab === 'calories'
                    ? `${totals.calories} kcal`
                    : activeTab === 'duration'
                      ? `${Math.round(totals.minutes)} min`
                      : `${totals.sessions} sessions`}
                </Text>
              </View>

              <View style={styles.chartContainer}>
                {dailyTotals.map((day) => (
                  <View key={day.label} style={styles.barRow}>
                    <Text style={styles.barLabel}>{day.label}</Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${Math.max((day.value / maxValue) * 100, 6)}%`,
                            backgroundColor: activeMeta.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barValue}>{formatValue(day.value)}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.motivationHeader}>
                <Sparkles size={18} color={Colors.secondary} strokeWidth={2.2} />
                <Text style={styles.sectionTitle}>Motivation Boost</Text>
              </View>
              <Text style={styles.motivationText}>
                {logs.length > 0
                  ? 'Look at those bars grow! Keep the streak alive and your charts will glow brighter every day.'
                  : 'Your charts are waiting for their first victory lap. Start a quick session and watch the progress light up!'}
              </Text>
            </View>
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
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    marginTop: 12,
    marginBottom: 18,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.accent,
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tabLabelActive: {
    color: Colors.white,
  },
  seriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seriesTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  seriesValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  chartContainer: {
    gap: 10,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    width: 32,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  barTrack: {
    flex: 1,
    height: 12,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 8,
  },
  barValue: {
    minWidth: 60,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  motivationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  motivationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
